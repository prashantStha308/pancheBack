import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { deleteFromCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Following from "../models/following.model.js"
import mongoose from "mongoose";
import { handleImageUploads } from "../utils/helper.js";

export const createUser = async (req, res, next) => {
    let coverArtId , backgroundId;
    try {
        const body = req.body;
        const location = JSON.parse(body.location);

        if (!body.username || !body.fullName || !body.email || !body.password || !body.role || !location ) {
            throw new ApiError(400, 'Required Feilds not filled');
        }
        // Check if the user already exists
        const email = body.email;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ApiError(400, 'User with this email already exists'));
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const { coverArt, backgroundArt } = await handleImageUploads(req.files);
        coverArtId = coverArt.publicId;
        backgroundId = backgroundArt.publicId !== coverArt.publicId ? backgroundArt.publicId : null;
        
        const user = await User.create({
            ...body,
            location,
            password: hashedPassword,
            coverArt,
            backgroundArt,
        })

        if (!user) {
            throw new ApiError(500, "Something went wrong while registering a user");
        }

        return res.status(201).json(new ApiResponse(200, 'User Created Successfully', { id: user._id }));

    } catch (error) {
        if (backgroundId) {
            await deleteFromCloudinary(backgroundId, 'image', 'image');
        }
        if (coverArtId) {
            await deleteFromCloudinary(coverArtId, 'image', 'image');
        }

        return next(new ApiError(500, error.message || 'Unexpected error occured'));
    }
}

export const loginUser = async (req, res, next) => {
    const body = req.body;

    const email = body.email;
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'Unregistered Email');
    }

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
        throw new ApiError('400', "Invalid Password");
    }

    return res.status(200).json(new ApiResponse(200, 'Logged In Successfully', { id: user._id }));

}

// get details of logged in user
export const getUserDetails = async (req, res, next) => {
    // jwt tokens configure garera garnu
}

export const userDetails = async (req, res, next) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, 'Invalid Id');
    }

    const user = await User.findById(userId).select('-password -subscription')

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // get followers
    // populate garnu parne xa
    const followers = await Following.find({ receiver: userId }).select('sender').populate({
        path: 'sender',
        select: '_id username role profilePicture'
    }).lean();
    const followersList = followers.map(item => item.sender);

    // get followings
    const followings = await Following.find({ sender: userId }).select('receiver').populate({
        path: 'receiver',
        select: '_id username role profilePicture'
    }).lean();
    const followingsList = followings.map(item => item.receiver);

    res.status(200).json(new ApiResponse(200, 'User found', {
        ...user,
        followersCount: followersList.length ,
        followers: followersList,
        followingsCount: followingsList.length,
        followings: followingsList
    }))

}

export const getAllUsers = async (req, res, next) => {
    const users = await User.find({}).select('-password -email');
    res.status(200).json(new ApiResponse(200, 'All users fetched successfully', users));
}

export const deleteUser = async (req, res, next) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid Id');
    }
    
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(400, 'User not found');
    }

    if (user.profilePicture.publicId) {
        await deleteFromCloudinary(user.profilePicture.publicId, 'image', 'image');
    }

    if (user.coverPicture.publicId) {
        await deleteFromCloudinary(user.coverPicture.publicId, 'image', 'image');
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    res.status(200).json(new ApiResponse(200 , "User Deleted Successfully" , {id: deletedUser._id}))

}