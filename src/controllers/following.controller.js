import Following from "../models/following.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateMongoose } from "../utils/helper.js";

const isExistingFollow = async (userId, receiverId) => {
    return await Following.findOne({ sender: userId, receiver: receiverId });
}

const getAssociate = async (queryObj , path) => {
    return await Following.find(queryObj).select(path).populate({
        path,
        select: 'username profilePicture role'
    }).lean()
}

export const toggleFollow = async (req, res, next) => {
    const userId = req.user.id;
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

    const followings = await getAssociate({ sender: userId }, 'receiver');

    res.status(200).json(new ApiResponse(200, "Fetched Followings successfully", followings));
}

export const getAllFollowers = async (req, res, next) => {
    console.log("Get All followers hit");
    const userId = req.user.id

    const followers = await getAssociate({ receiver: userId }, 'sender');
    console.log(followers);

    res.status(200).json(new ApiResponse(200, "Fetched Followers successfully", followers));
}