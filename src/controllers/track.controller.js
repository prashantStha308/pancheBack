import mongoose from "mongoose";
import Track from "../models/track.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parseBuffer } from "music-metadata";
import SavedTrack from "../models/saves/trackSave.model.js";
import { handleFilesUploads } from "../utils/helper.js";


export const createTrack = async (req, res, next) => {
    let audioId, coverId, bgId;
    try {
        const { name , primaryArtist , visibility , artists=[] , genre=[] } = req.body;

        if (!name || !primaryArtist || !visibility) {
            return next(new ApiError(400, 'Required fields not submitted'));
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
            throw new Error("Something went wrong while creating track");
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
        let { page = 1, limit = 5 } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));

        const trackRes = await Track.find({}).skip((page - 1) * limit).limit(limit).populate({
            path: 'primaryArtist',
            select: 'username , profilePicture , bio , followerCount'
        }). populate({
            path: 'artists',
            select: 'username , profilePicture , bio , followerCount'
        });

        return res.status(200).json(new ApiResponse(200, 'Successfully fetched tracks', trackRes));

    } catch (error) {
        return new ApiError(500, `Something went wrong with error: ${error} `);
    }
}

export const getTrackById = async (req, res, next) => {
    const { trackId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(trackId)) {
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
    }))

}

export const updateTrack = async (req, res, next) => {
    const body = req.body;
}