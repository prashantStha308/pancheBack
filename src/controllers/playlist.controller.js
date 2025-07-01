import mongoose from "mongoose";
import Playlist from "../models/playlist.model.js";
import Track from "../models/track.model.js";
import { deleteFromCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handleImageUploads, reorderTracks } from "../utils/helper.js";
import SavedPlaylist from "../models/saves/playlistSave.model.js";
import validateMongoose from "../utils/ValidateMongoose.js";

export const createPlaylist = async (req, res) => {
    let coverArtId;
    try {
        const body = req.body;
        console.log(body);
        // get userId by jwt token onces configured

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
    const { playlistId } = req.params;

    if (!validateMongoose(playlistId)) {
        throw new ApiError(400, "Invalid Id");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);
    // delete all saves associated with this playlist
    const saves = await SavedPlaylist.find({ resource: playlistId })
    saves.forEach(async(save) => {
        await SavedPlaylist.findByIdAndDelete(save._id);
    })

    if (playlist.coverArt.publicId && playlist.coverArt.publicId !== ""  ) {
        await deleteFromCloudinary(playlist.coverArt.publicId, 'image');
    }
}