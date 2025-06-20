import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Following from "../models/following.model.js"
import mongoose from "mongoose";

export const createUser = async (req, res, next) => {
    let profileId , coverId;
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
        
        if (req.files.profilePicture) {
            const imgRes = await uploadToCloudinary(req.files.profilePicture[0].buffer, 'image', 'image');
            profileId = imgRes.public_id;
            var profilePicture = {
                src: imgRes.secure_url,
                publicId: profileId
            }
        }

        const coverPicture = {
            src: profilePicture.src,
            publicId: profilePicture.publicId
        }

        if (req.files.coverPicture) {
            const imgRes = await uploadToCloudinary(req.files.coverPicture[0].buffer, 'image', 'image');
            coverId = imgRes.public_id;
            coverPicture.src = imgRes.secure_url;
            coverPicture.publicId = coverId;
        }
        
        const user = await User.create({
            ...body,
            location,
            password: hashedPassword,
            profilePicture,
            coverPicture,
        })

        if (!user) {
            throw new ApiError(500, "Something went wrong while registering a user");
        }

        return res.status(201).json(new ApiResponse(200, 'User Created Successfully', { id: user._id }));

    } catch (error) {
        if (coverId) {
            await deleteFromCloudinary(coverId, 'image', 'image');
        }
        if (profileId) {
            await deleteFromCloudinary(profileId, 'image', 'image');
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
        throw new ApiError(400, 'Invalid Id');
    }

    const user = await User.findById(userId).select('-password -subscription')

    if (!user) {
        throw new ApiError(400, 'User not found');
    }

    // get followers
    const followers = await Following.find({ receiver: userId }).select('sender');
    const followersList = followers.map(item => item.sender);

    // get followings
    const followings = await Following.find({ sender: userId }).select('receiver');
    const followingsList = followings.map(item => item.receiver);

    res.status(200).json(new ApiResponse(200, 'User found', {
        ...user.toObject(),
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