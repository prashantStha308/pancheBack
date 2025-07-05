import mongoose from "mongoose";
import Track from "../models/track.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parseBuffer } from "music-metadata";
import SavedTrack from "../models/saves/trackSave.model.js";
import User from "../models/user.model.js";
import { allTracks, handleFilesUploads , sortTracks, validateMongoose } from "../utils/helper.js";
import Playlist from "../models/playlist.model.js";
import { validationResult } from "express-validator";


export const createTrack = async (req, res, next) => {
    const userId = req.user.id;
    let audioId, coverId;
    if (!userId) {
        throw new ApiError(401, "userId must be present");
    }
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            throw new ApiError(400 , "Validation Error", "" ,errors.array());
        }
        const user = await User.findById(userId).select('role');
        if (!user) {
            throw new ApiError(404, "Invalid user");
        }
        if (user.role !== 'artist') {
            throw new ApiError(401, "User must be an artist to create a track");
        }

        const { name , visibility , artists=[] , genre=[] } = req.body;

        if (!name || !visibility) {
            throw new ApiError(400, 'Required fields not submitted');
        }

        // if artists is not passed by client, make it an array containing only primaryArtist
        if (!Array.isArray(artists) && artists.length === 0) {
            artists = [userId];
        }

        const { audioRes, coverArt } = await handleFilesUploads(req.files);

        audioId = audioRes.publicId;
        coverId = coverArt.publicId;

        const musicMetadata = await parseBuffer(req.files.track[0].buffer, 'audio/mpeg');
        const totalDuration = musicMetadata.format.duration;

        const track = await Track.create({
            name,
            primaryArtist,
            artists,
            coverArt,
            audio: {
                streamUrl: `/api/track/${audioRes.public_id}/stream`,
                publicId: audioRes.public_id.split('/')[1]
            },
            visibility,
            totalDuration,
            genre
        })

        if (!track) {
            throw new ApiError(500,"Something went wrong while creating track");
        }

        res.status(201).json(new ApiResponse(201, 'Track Created Successfully', {id: track._id}));

    } catch (error) {

        if (audioId) await deleteFromCloudinary(audioId, 'video');
        if (coverId) await deleteFromCloudinary(coverId, 'image');

        return next(new ApiError(500, error.message));
    }
}

export const getAllTracks = async ( req ,res , next ) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            throw new ApiError(400 , "Validation Error", "" ,errors.array());
        }
        let { page = 1, limit = 5 , sort , artist } = req.query;

        const trackRes = sort ? await sortTracks(req.query) : await allTracks(req.query);

        return res.status(200).json(new ApiResponse(200, 'Successfully fetched tracks', trackRes));

    } catch (error) {
        return new ApiError(500, `Something went wrong with error: ${error} `);
    }
}

export const getTrackById = async (req, res, next) => {
    const errors = validationResult(req);
        
    if (!errors.isEmpty()) {
        throw new ApiError(400 , "Validation Error", "" ,errors.array());
    }

    const { trackId } = req.params;

    if (!validateMongoose(trackId)) {
        throw new ApiError(400, 'Invalid Track Id');
    }

    const track = await Track.findById(trackId).lean();
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
    const errors = validationResult(req);
        
    if (!errors.isEmpty()) {
        throw new ApiError(400 , "Validation Error", "" ,errors.array());
    }

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
        
        const updatedTrackList = playlist.trackList.filter(track => !track._id.equals(trackId));
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
    const userId = req.user.id;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        throw new ApiError(400 , "Validation Error", "" ,errors.array());
    }
    const { trackId } = req.params;
    const {
        name,
        artists,
        visibility,
        genre,
    } = req.body;
    const imageFile = req.file;

    if (!userId) {
        throw new ApiError(401, "userId must be present");
    }

    try {
        const track = await Track.findById(trackId);
        if (!track) {
        return res.status(404).json({ message: 'Track not found' });
        }

        if (track.primaryArtist !== userId) {
            throw new ApiError(401, "Track can only be updated by the primaryArtist");
        }

        if (name) track.name = name;
        if (artists && Array.isArray(artists)) track.artists = artists;
        if (visibility) track.visibility = visibility;
        if (genre && Array.isArray(genre)) track.genre = genre;

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

export const updatePlayCount = async (req, res) => {
    const userId = req.user.id;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        throw new ApiError(400 , "Validation Error", "" ,errors.array());
    }
    const { trackId } = req.params;

    if (!userId) {
        throw new ApiError(401, "Must have a valid userId");
    }

    if (!validateMongoose(trackId)) {
        throw new ApiError(400, "Invalid playlist id");
    }
    const track = await Track.findById(trackId);
    if (!track) {
        throw new ApiError(404, "Track not found");
    }

    track.playCount++;
    await track.save();

    res.status(200).json(new ApiResponse(200, "playcount++"));
}