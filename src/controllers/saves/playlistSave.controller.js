import SavedPlaylist from "../../models/saves/playlistSave.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateMongoose } from "../../utils/helper.js";
import { validationResult } from "express-validator";

const isExistingSave = async (playlistId, userId) => {
    const save = await SavedPlaylist.findOne({ playlist: playlistId, savedBy: userId });

    return save;
}

export const togglePlaylistSave = async (req, res, next) => {
    const userId = req.user.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400 , "Validation Error", "" ,errors.array());
    }

    const { playlistId } = req.params;

    if (!userId || !validateMongoose(userId)) {
        throw new ApiError(400, "Valid userId must be present");
    }

    if (!validateMongoose(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const save = await isExistingSave(playlistId, userId);
    if (save) {
        await SavedPlaylist.findOneAndDelete({ playlist: playlistId, savedBy: userId });
        return res.status(200).json(new ApiResponse(200, 'Removed playlist from saved'));
    }

    const savedItem = await SavedPlaylist.create({
        playlist: playlistId,
        savedBy: userId
    });
    res.status(200).json(new ApiResponse(200, 'Saved playlist', savedItem));
}

// get all playlist saved by the user
export const getAllPlaylistSaves = async (req, res, next) => {
    const userId = req.user.id;
    let { page = 1, limit = 10 } = req.query;
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    if (!userId || !validateMongoose(userId)) {
        throw new ApiError(400, "Valid userId must be present");
    }

    const saves = await SavedPlaylist.find({ savedBy: userId }).select('playlist').populate({
        path: 'playlist',
        select: '_id name type primaryArtist artists createdBy coverArt totalDuration',
        populate: {
            path: 'createdBy',
            select: 'username fullName role profilePicture'
        },
        populate: {
            path: 'primaryArtist',
            select: 'username fullName role profilePicture'
        },
        populate: {
            path: 'artists',
            select: 'username fullName role profilePicture'
        }
    }).skip((page - 1) * limit).limit(limit).lean();

    const totalSaveCount = await SavedPlaylist.countDocuments({ savedBy: userId });

    res.status(200).json(new ApiResponse(200, `Fetched ${saves.length} saves from page ${page}`, {
        ...saves,
        page,
        limit,
        totalSaveCount,
        nextPageExists: page * limit < totalSaveCount
    }));

}