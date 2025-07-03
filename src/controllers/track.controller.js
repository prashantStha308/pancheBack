import mongoose from "mongoose";
import Track from "../models/track.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parseBuffer } from "music-metadata";
import SavedTrack from "../models/saves/trackSave.model.js";
import { allTracks, handleFilesUploads , sortData, validateMongoose } from "../utils/helper.js";
import Playlist from "../models/playlist.model.js";


export const createTrack = async (req, res, next) => {
    let audioId, coverId, bgId;
    try {
        const { name , primaryArtist , visibility , artists=[] , genre=[] } = req.body;

        if (!name || !primaryArtist || !visibility) {
            throw new ApiError(400, 'Required fields not submitted');
        }

        // if artists is not passed by client, by make it an array containing only primaryArtist
        if (!Array.isArray(artists) || artists.length === 0) {
            artists = [primaryArtist];
        }

        const { audio, coverArt, backgroundArt } = await handleFilesUploads(req.files);

        audioId = audio.publicId;
        coverId = coverArt.publicId;
        bgId = backgroundArt.publicId !== coverArt.publicId ? backgroundArt.publicId : null;

        const musicMetadata = await parseBuffer(req.files.track[0].buffer, 'audio/mpeg');
        const totalDuration = musicMetadata.format.duration;

        const track = await Track.create({
            name,
            primaryArtist,
            artists,
            coverArt,
            backgroundArt,
            audio,
            visibility,
            totalDuration,
            genre
        })

        if (!track) {
            throw new ApiError(500,"Something went wrong while creating track");
        }

        res.status(201).json(new ApiResponse(201, 'Track Created Successfully', track));

    } catch (error) {

        if (audioId) await deleteFromCloudinary(audioId, 'video');
        if (coverId) await deleteFromCloudinary(coverId, 'image');
        if (bgId) await deleteFromCloudinary(bgId, 'image');

        return next(new ApiError(500, error.message));
    }
}

export const getAllTracks = async ( req ,res , next ) => {
    try {
        let { page = 1, limit = 5 , sort } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));

        const trackRes = sort ? await sortData(Track, sort, page, limit) : await allTracks(page, limit);

        return res.status(200).json(new ApiResponse(200, 'Successfully fetched tracks', trackRes));

    } catch (error) {
        return new ApiError(500, `Something went wrong with error: ${error} `);
    }
}

export const getTrackById = async (req, res, next) => {
    const { trackId } = req.query;

    if (!validateMongoose(trackId)) {
        throw new ApiError(400, 'Invalid Track Id');
    }

    const track = await Track.findById(trackId);
    const saves = await SavedTrack.find({ resource: trackId }).populate({
        path: 'savedBy',
        select: '_id username role profilePicture'
    }).lean();
    const savedBy = saves.map(item => item.savedBy);

    res.status(200).json(new ApiResponse(200, "Fetched Track Successfully", {
        ...track,
        savedBy,
        saveCount: savedBy.length
    }));

}

export const deleteTrackById = async (req, res, next) => {
    let { trackId } = req.params;

    if (!validateMongoose(trackId)) {
        throw new ApiError(400, "Invalid track Id");
    }

    trackId = mongoose.Types.ObjectId(trackId);

    const track = await Track.findByIdAndDelete(trackId);

    // IF track is null, throw an error
    if (!track) {
        throw new ApiError(400, 'Track not found');
    }
    
    // Delete datas from cloudinary
    if (track.audio.publicId) {
        await deleteFromCloudinary(track.audio.publicId, 'video');
    }

    if (track.coverArt.publicId) {
        await deleteFromCloudinary(track.coverArt.publicId, 'image');
    }

    // update all playlist and users/artists

    // Updates playlists
    const playlistsHavingTrack = await Playlist.find({ trackList: trackId }).populate('trackList');

    for (const playlist of playlistsHavingTrack) {
        playlist.totalDuration = (playlist.totalDuration || 0) - (track.totalDuration || 0);
        
        const updatedTrackList = playlist.trackList.filter(track => track._id.equals(trackId) );
        playlist.trackList = updatedTrackList;

        // pre hook updates artist field while saving
        await playlist.save();
    }

    // remove all saves associated with this trackID
    await SavedTrack.deleteMany({ track: trackId });

    // update all artists associated with this track
    const artists = await User.find({ trackList: trackId, role: 'artist' });

    for(const artist of artists) {
        const updatedArtistTrackList = artist.trackList.filter(track => track !== trackId);
        artist.trackList = updatedArtistTrackList;
        await artist.save();
    }

    res.status(200).json(new ApiResponse(200, "Deleted Track Successfully", { id: trackId }));
}

export const updateTrackById = async (req, res, next) => {
    const { trackId } = req.params;
    const {
        name,
        artists,
        playCount,
        visibility,
        genre,
        durationPlayed,
    } = req.body;
    const imageFile = req.file;

    const track = await Track.findById(trackId);
    if (!track) {
    return res.status(404).json({ message: 'track not found' });
    }

    try {
        if (name) track.name = name;
        if (artists && Array.isArray(artists)) track.artists = artists;
        if (playCount) track.playCount = playCount;
        if (visibility) track.visibility = visibility;
        if (genre && Array.isArray(genre)) track.genre = genre;
        if (durationPlayed) track.durationPlayed = durationPlayed;

        if (imageFile) {
            const imgRes = await uploadToCloudinary(imageFile.buffer, 'image', 'image');
            if (track.coverArt.publicId) {
                await deleteFromCloudinary(track.coverArt.publicId , 'image');
            }
            track.coverArt.src = imgRes.secure_url;
            track.coverArt.publicId = imgRes.public_id;
        }

        await track.save();
        res.json({ data: track });
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            // Format errors for the frontend
            const errors = {};
            for (let field in err.errors) {
            errors[field] = {
                message: err.errors[field].message
            };
            }
            return res.status(400).json({ errors });
        }
        next(err);
    }
}