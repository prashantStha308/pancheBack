import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { deleteFromCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handleImageUploads , validateMongoose , getFollowers , getFollowings , getSavedTracks , getSavedPlaylist } from "../utils/helper.js";
import { JWT_SECRET } from "../config/env.config.js";

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
    console.log(body);

    const email = body.email;
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'Unregistered Email');
    }

    const isMatch = bcrypt.compare(body.password, user.password);
    if (!isMatch) {
        throw new ApiError('400', "Invalid Password");
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: '30d',
    });

    return res.status(200).json(new ApiResponse(200, 'Logged In Successfully', { token }));

}

// get details of logged in user
export const getUserDetails = async (req, res, next) => {
    const userId = req.user.id;

    if (!validateMongoose(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }

    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    const followers = await getFollowers(userId);
    const followings = await getFollowings(userId);
    const savedTracks = await getSavedTracks(userId);
    const savedPlaylist = await getSavedPlaylist(userId);
    // purano baasna ankita pun

    res.status(200).json(new ApiResponse(200, "User Fetched Succesfully", {
        ...user,
        followersCount: followers.length ,
        followers,
        followingsCount: followings.length,
        followings,
        savedTracks,
        savedPlaylist,
    }));

}
// user detail sby ID
export const userDetails = async (req, res, next) => {
    const { userId } = req.params;

    if (!validateMongoose(userId)) {
        throw new ApiError(404, 'Invalid Id');
    }

    const user = await User.findById(userId).select('-password -email -location -dob -subscription').lean();

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const followers = await getFollowers(userId);
    const followings = await getFollowings(userId);

    res.status(200).json(new ApiResponse(200, 'User found', {
        ...user,
        followersCount: followers.length ,
        followers,
        followingsCount: followings.length,
    }))

}

export const getAllUsers = async (req, res, next) => {

    let { role = 'all', limit = 10, page = 1 } = req.query;

    limit = Math.max(5, parseInt(limit));
    page = Math.max(1, parseInt(page));

    let users;
    const query = role === 'all' ? {} : { role };

    users = await User.find(query).select('-password -location -dob -subscription').skip((page - 1) * limit).limit(limit);

    res.status(200).json(new ApiResponse(200, `Fetched ${role === 'all' ? 'all users' : role + 's'} successfully`, users));
}

export const deleteUser = async (req, res, next) => {
    const { userId } = req.params;

    if (!validateMongoose(userId)) {
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

export const updateUserById = async (req, res, next) => {
    const { userId } = req.params;

    if (!validateMongoose(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }
}