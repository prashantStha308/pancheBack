import SavedTrack from "../../models/saves/trackSave.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { validateMongoose } from "../../utils/helper.js";
const isExistingSave = async (trackId, userId) => {
    console.log("Is Existing hit");
    const user = await SavedTrack.findOne({ track: trackId, savedBy: userId });

    return user;
}


// New Save Controllers

const removeSave = async (trackId , userId) => {
    await SavedTrack.findOneAndDelete({ track: trackId, savedBy: userId });
}

export const toggletrackSave = async (req, res) => {
    const userId = req.user.id;
    const { trackId } = req.params;

    if (!validateMongoose(trackId)) {
        throw new ApiError(400, "Invalid trackId");
    }

    const save = await isExistingSave(trackId, userId);
    if (save) {
        await removeSave(trackId, userId);
        res.status(200).json(new ApiResponse(200, 'Removed track from saved'));
    }

    const savedItem = await SavedTrack.create({
        track: trackId,
        savedBy: userId
    });
    res.status(200).json(new ApiResponse(200, 'Saved track', savedItem));
}

// get all track saved by the user
export const getAlltrackSaves = async (req, res) => {
    const userId = req.user.id;
    let { page = 1, limit = 10 } = req.query;
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    const saves = await SavedTrack.find({ savedBy: userId }).select('track').populate({
        path: 'track',
        select: '_id name type primaryArtist artists coverArt totalDuration',
        populate: {
            path: 'primaryArtist',
            select: 'username fullName role profilePicture'
        },
        populate: {
            path: 'artists',
            select: 'username fullName role profilePicture'
        }
    }).skip((page - 1) * limit).limit(limit).lean();

    const totalSaveCount = await SavedTrack.countDocuments({ savedBy: userId });

    res.status(200).json(new ApiResponse(200, `Fetched ${limit} saves from page ${page}`, {
        ...saves,
        page,
        limit,
        totalSaveCount,
        nextPageExists: page * limit < totalSaveCount
    }));

}