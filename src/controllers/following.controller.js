import Following from "../models/following.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateMongoose } from "../utils/helper.js";
import { param, validationResult } from "express-validator";


const isExistingFollow = async (userId, receiverId) => {
    return await Following.findOne({ sender: userId, receiver: receiverId });
}

const getAssociate = async (queryObj, path, params) => {

    const { page = 1, limit = 50 } = params;

    return await Following.find(queryObj).limit( (page - 1) * limit ).skip(limit).select(path).populate({
        path,
        select: '_id username profilePicture role'
    }).lean()
}

export const toggleFollow = async (req, res, next) => {
    const userId = req.user.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Error", "", errors.array());
    }

    const { receiverId } = req.params;

    if (!validateMongoose(receiverId)) {
        throw new ApiError(400, "Invalid User Id");
    }
    const follow = await isExistingFollow(userId, receiverId);
    if (follow) {
        await Following.deleteOne({ sender: userId, receiver: receiverId });
        return res.status(200).json(new ApiResponse(200, "Removed Following"));
    }

    const newFollow = await Following.create({
        sender: userId,
        receiver: receiverId
    });

    if (!newFollow) {
        throw new ApiError(500, "Unexpected Error occured on our end");
    }

    res.status(201).json(new ApiResponse(200, "Followed sucessfully", newFollow));
}

export const getAllFollowings = async (req, res, next) => {
    const userId = req.user.id
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Error", "", errors.array());
    }

    const followings = await getAssociate({ sender: userId }, 'receiver' , req.params);

    const totalFollowings = await Following.countDocuments({sender: userId});

    res.status(200).json(new ApiResponse(200, "Fetched Followings successfully", {
        ...followings,
        totalFollowings
    }));
}

export const getAllFollowers = async (req, res, next) => {
    const userId = req.user.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Error", "", errors.array());
    }

    const followers = await getAssociate({ receiver: userId }, 'sender', req.params);
    const totalFollowers = await Following.countDocuments({receiver: userId});

    res.status(200).json(new ApiResponse(200, "Fetched Followers successfully", {
        ...followers,
        totalFollowers
    }));
}