import mongoose from "mongoose";
import Playlist from "../models/playlist.model.js";
import Track from "../models/track.model.js";
import { deleteFromCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handleImageUploads, reorderTracks , validateMongoose } from "../utils/helper.js";
import SavedPlaylist from "../models/saves/playlistSave.model.js";
import { validationResult } from "express-validator";


export const createPlaylist = async (req, res) => {
    let coverArtId;
    try {
        const userId = req.user.id;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const body = req.body;
        
        if (!userId) {
            throw new ApiError(401, "Must have valid userId");
        }

        if (!Array.isArray(body.trackList) || body.trackList.length < 1) {
            throw new ApiError(400, "body.trackList must be an array containing atleast 1 track._id");
        }

        const artists = await Promise.all(
            body.trackList.map(async (item) => {
                const artist = await Track.findById(item).populate({
                    path: 'artists',
                    select: '_id'
                });
                return artist;
            })
        )

        const coverArt = await handleImageUploads(req.file);
        coverArtId = coverArt.publicId;

        const reorderedTrackList = await reorderTracks(body.trackList);

        // handleDuration
        const totalDuration = reorderedTrackList.reduce((sum , track) => {
            return sum + (track.totalDuration);
        } , 0)

        const newPlaylist = await Playlist.create({
            ...body,
            createdBy: userId,
            trackList: reorderedTrackList,
            artists,
            coverArt,
            totalDuration
        });

        if (!newPlaylist) {
            throw new ApiError(500, "Some Error occured while creating playlist");
        }

        res.status(201).json(new ApiResponse(201, 'Created PLaylist Successfully', { id: newPlaylist._id }));

    } catch (error) {
        if (coverArtId) {
            await deleteFromCloudinary(coverArtId , 'image');
        }
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: error.errors
            });
        }

        // Unknown error - fallback
        console.error("Unexpected error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const getAllPlaylist = async (req, res, next) => {
    const errors = validationResult(req);
            
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let { page = 1, limit = 5 } = req.query;
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    const playlists = await Playlist.find({}).skip((page - 1) * limit).limit(limit).populate({
        path: 'trackList',
        select: '_id name artists audio coverArt totalDuration',
        populate: {
            path: 'artists',
            select: '_id username role profilePicture'
        }
    }).lean();

    if (!playlists) {
        throw new ApiError(500, "Failed to get playlists");
    }

    res.status(200).json(new ApiResponse(200, 'Fetched Playlists successfully', playlists));
}

export const getPlaylistById = async (req, res, next) => {
    const errors = validationResult(req);
            
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { playlistId } = req.params;

    if (!validateMongoose(playlistId)) {
        throw new ApiError(400, "Invalid Id");
    }

    const playlist = await Playlist.findById(playlistId).lean();
    const saves = await SavedPlaylist.find({ resource: playlistId }).populate({
        path: 'savedBy',
        select: '_id username role profilePicture'
    }).lean();
    const savedBy = saves.map(item => item.savedBy);

    res.status(200).json(new ApiResponse(200, "Fetched Playlist Successfully", {
        ...playlist,
        savedBy,
        saveCount: savedBy.length
    }));

}

export const deletePlaylistById = async (req, res) => {
    const userId = req.user.id;
    const errors = validationResult(req);
            
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { playlistId } = req.params;

    if (!userId) {
        throw new ApiError(401, "User ID is required");
    }

    if (!validateMongoose(playlistId)) {
        throw new ApiError(400, "Invalid Id");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.createdBy !== userId) {
        throw new ApiError(401, "Playlist can only be updated by owner");
    }

    await playlist.findByIdAndDelete(playlistId);
    // delete saves associated with this playlist
    const saves = await SavedPlaylist.find({ resource: playlistId })
    saves.forEach(async(save) => {
        await SavedPlaylist.findByIdAndDelete(save._id);
    })

    // also need to delete playlist from user's save playlists

    if (playlist.coverArt.publicId && playlist.coverArt.publicId !== ""  ) {
        await deleteFromCloudinary(playlist.coverArt.publicId, 'image');
    }
}

export const addTrackToPlaylist = async (req, res, next) => {
    const userId = req.user.id;
    const errors = validationResult(req);
            
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { playlistId } = req.params;
    // body should be trackId: id
    const body = req.body;

    if (!validateMongoose(playlistId) || !validateMongoose(body.id)) {
        throw new ApiError(400, "Invalid ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.createdBy !== userId) {
        throw new ApiError(401 , "Playlist must belong to you to update");
    }

    if (playlist.trackList.includes(body.id)) {
        return res.status(200).json(new ApiResponse(200, "Track is already saved"));
    }

    playlist.trackList.push(body.id);

    await playlist.save();
    res.status(200).json(new ApiResponse(200, "Track added successfully"));
}

export const updatePlayCount = async (req, res) => {
    const userId = req.user.id;
    const errors = validationResult(req);
            
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { playlistId } = req.params;
    if (!validateMongoose(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.playCount++;
    await playlist.save();

    res.status(200).json(new ApiResponse(200, "playcount++"));
}

export const updateTotalPlayDuration = async (req, res, next) => {
    
}

export const updatePlaylistById = async (req, res, next) => {
    const userId = req.user.id;
    const errors = validationResult(req);
            
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { playlistId } = req.params;
    const {
        name,
        visibility,
        durationPlayed,
    } = req.body;
    const imageFile = req.file;

    if (!validateMongoose(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        if (playlist.createdBy !== userId) {
            throw new ApiError(401, "Playlist can only be updated by owner");
        }

        if (name) playlist.name = name;
        if (visibility) playlist.visibility = visibility;
        if (durationPlayed) playlist.durationPlayed = durationPlayed;

        if (imageFile) {
            const imgRes = await uploadToCloudinary(imageFile.buffer, 'image', 'image');
            if (playlist.coverArt.publicId) {
                await deleteFromCloudinary(playlist.coverArt.publicId , 'image');
            }
            playlist.coverArt.src = imgRes.secure_url;
            playlist.coverArt.publicId = imgRes.public_id;
        }

        await playlist.save();
        res.json({ data: playlist });
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