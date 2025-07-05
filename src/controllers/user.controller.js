// Necessaries
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.config.js";
// Models
import User from "../models/user.model.js";
// Cloudinary services
import {
    deleteFromCloudinary,
    uploadToCloudinary
} from "../services/cloudinary.services.js";
// Helper functions
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    handleImageUploads,
    validateMongoose,
    getFollowers,
    getFollowings,
    getSavedTracks,
    getSavedPlaylist,
    getCreatedPlaylist,
    getCreatedTracks
} from "../utils/helper.js";
// Validator
import { validationResult } from "express-validator";

export const createUser = async (req, res, next) => {
    let profilePictureId , coverArtId;
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ApiError(400 , "Validation Error", "" ,errors);
        }

        const body = req.body;
        const files = req.files;

        if (!body.username || !body.fullName || !body.email || !body.password || !body.role || !body.location ) {
            throw new ApiError(400, 'Required Feilds not filled');
        }
        // Check if the user already exists
        const email = body.email;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ApiError(400, 'User with this email already exists'));
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        let profilePicture = {
            src: "https://res.cloudinary.com/dww0antkw/image/upload/v1747984790/deafultImg_woxk8f.png",
            publicId: ""
        }

        let coverArt = { ...profilePicture };

        if (files.profilePicture) {
            profilePicture = await handleImageUploads(files.profilePicture);
            profilePictureId = profilePicture.publicId;
        }

        if (files.coverArt) {
            coverArt = await handleImageUploads(files.profilePicture);
            coverArtId = coverArt.publicId;
        }
        
        const user = await User.create({
            ...body,
            password: hashedPassword,
            profilePicture,
            coverArt,
            backgroundArt,
        })

        if (!user) {
            throw new ApiError(500, "Something went wrong while registering a user");
        }

        return res.status(201).json(new ApiResponse(200, 'User Created Successfully', { id: user._id }));

    } catch (error) {
        if (profilePictureId) {
            await deleteFromCloudinary(profilePictureId, 'image', 'image');
        }
        if (coverArtId) {
            await deleteFromCloudinary(coverArtId, 'image', 'image');
        }

        return next(new ApiError(500, error.message || 'Unexpected error occured'));
    }
}

export const loginUser = async (req, res, next) => {
     const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(400 , "Validation Error", "" ,errors);
    }

    const body = req.body;

    const email = body.email;
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'Unregistered Email');
    }

    const isMatch = bcrypt.compare(body.password, user.password);
    if (!isMatch) {
        throw new ApiError('400', "Invalid Password");
    }

    const token = jwt.sign({ id: user._id , role: user.role }, JWT_SECRET, {
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

    const createdPlaylists = await getCreatedPlaylist(userId);
    
    let createdTracks
    if (user.role === 'artist') createdTracks = await getCreatedTracks(userId);

    res.status(200).json(new ApiResponse(200, "User Fetched Succesfully", {
        ...user,
        followersCount: followers.length ,
        followers,
        followingsCount: followings.length,
        followings,
        savedTracks,
        savedPlaylist,
        createdPlaylists,
        createdTracks
    }));

}
// user detail by ID
export const userDetailsById = async (req, res, next) => {
    const errors = validationResult(req);
        
    if (!errors.isEmpty()) {
        throw new ApiError(400 , "Validation Error", "" ,errors);
    }
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(400 , "Validation Error", "" ,errors);
    }
    let { limit = 10, page = 1 , city , country , search } = req.query;

    const queryObj = { role: 'user' };
    if (city) {
        queryObj['location.city'] = city;
    }
    if (country) {
        queryObj['location.country'] = country;
    }
    if (search) {
        queryObj['username'] = search;
    }

    const users = await User.find(queryObj).select('-password -location -dob -subscription -trackList -playLists').skip((page - 1) * limit).limit(limit);

    res.status(200).json(new ApiResponse(200, "Fetched Users successfully", users));
}

export const deleteUser = async (req, res, next) => {
    const userId = req.user.id;

    if (!userId) {
        throw new ApiError(401, "PLease authorize with a valid userId");
    }

    if (!validateMongoose(userId)) {
        throw new ApiError(400, 'Invalid Id');
    }
    
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
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

export const updateUser = async (req, res, next) => {
    let profilePictureId, coverArtId;
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ApiError(400 , "Validation Error", "" ,errors);
        }

        const userId = req.user.id;
        const {
            username,
            fullName,
            email,
            role,
            password
        } = req.body;
        const files = req.files;

        if (!validateMongoose(userId)) {
            throw new ApiError(400, "Invalid User ID");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (username) user.username = username;
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (role) user.role = role;
        if (password) user.password = await bcrypt.hash(password, 10);

        // update profilePicture if available
        if (files?.profilePicture) {
            const imgRes = await uploadToCloudinary(files.profilePicture[0].buffer, 'image', 'image');
            if (user.profilePicture.publicId) {
                await deleteFromCloudinary(user.profilePicture.publicId, 'image');
            }
            profilePictureId = imgRes.public_id;
            user.profilePicture.src = imgRes.secure_url;
            user.profilePicture.publicId = imgRes.public_id;
        }

        // update coverArt if available
        if (files?.coverArt) {
            const imgRes = await uploadToCloudinary(files.coverArt[0].buffer, 'image', 'image');
            if (user.coverArt.publicId) {
                await deleteFromCloudinary(user.coverArt.publicId, 'image');
            }
            coverArtId = imgRes.public_id;
            user.coverArt.src = imgRes.secure_url;
            user.coverArt.publicId = imgRes.public_id;
        }

        await user.save();
        
        res.status(200).json(new ApiResponse(200, "User updated successfully", { id: userId }));

    } catch (error) {
        if (profilePictureId) {
            await deleteFromCloudinary(profilePictureId, 'image');
        }

        if (coverArtId) {
            await deleteFromCloudinary(coverArtId, 'image');
        }
        next(error);
    }
}