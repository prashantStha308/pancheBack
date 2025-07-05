import mongoose from "mongoose";
import { uploadToCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "./ApiError.js";

// Models
import SavedTrack from "../models/saves/trackSave.model.js";
import SavedPlaylist from "../models/saves/playlistSave.model.js";
import Following from "../models/following.model.js"
import Track from "../models/track.model.js";
import Playlist from "../models/playlist.model.js";

export const handleFilesUploads = async ( files ) => {
    if (!files.coverArt) { return next(new ApiError(400, 'Missing coverArt')) };
    if (!files.track) { return next(new ApiError(400, 'Missing Audio file')) };

    // Upload audio and image files
    const [trackRes, imgRes] = await Promise.all([uploadToCloudinary(files.track[0].buffer, 'track', 'video'), uploadToCloudinary(files.coverArt[0].buffer, 'image', 'image')]);

    // create audio object
    const audio = {
        src: trackRes.secure_url,
        publicId: trackRes.public_id
    };
    // create coverArt object
    const coverArt = {
        src: imgRes.secure_url,
        publicId:  imgRes.public_id
    };
    
    return { audio , coverArt , backgroundArt }
}

export const handleImageUploads = async (file) => {

    const imgRes = await uploadToCloudinary(file[0].buffer, 'image', 'image');
    img = {
        src: imgRes.secure_url,
        publicId:  imgRes.public_id
    };    
    return img;
}

export const reorderTracks = async (trackList) => {

    if (!Array.isArray(trackList) || !trackList.every(item=> mongoose.Types.ObjectId.isValid(item)) ) {
        throw new ApiError(400, "trackList must be an array of valid ObjectIds");
    }

    const tracks = await Track.find({ _id: { $in: trackList } });

    const trackCopy = {};
    tracks.forEach( ( item )=>(
        trackCopy[item._id.toString()] = item
    ));

    const reorderedTrackList = trackList.map(id => trackCopy[id.toString()]);

    return reorderedTrackList;
}

export const validateMongoose = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}

export const getFollowers = async (userId) => {
    return await Following.find({ receiver: userId }).select('sender').populate({
        path: 'sender',
        select: '_id username role profilePicture'
    }).lean();
}

export const getFollowings = async (userId) => {
    return await Following.find({ sender: userId }).select('receiver').populate({
        path: 'receiver',
        select: '_id username role profilePicture'
    }).lean();
}

export const getSavedTracks = async (userId) => {
    return await SavedTrack.find({ savedBy: userId }).select('track').populate({
        path: 'track',
        select: "_id name primaryArtist coverArt genre coverArt "
    }).lean();
}

export const getCreatedTracks = async (userId) => {
    return await Track.find({ artists: userId }).lean();
}

export const getSavedPlaylist = async (userId) => {
    return await SavedPlaylist.find({ savedBy: userId }).select('playlist').populate({
        path: 'playlist',
        math: { type: 'playlist' },
        select: "_id name type createdBy primaryArtist coverArt"
    }).lean();
}

export const getCreatedPlaylist = async (userId) => {
    return await Playlist.find({ createdBy: userId }).populate({
        path: 'artists',
        select: '_id username role profilePicture'
    }).lean();
}

export const sortTracks = async (queries) => {
    
    const { page = 1, limit = 5, sort, artist , search } = queries;

    const sortByOptions = ["playCount", "durationPlayed","-playCount", "-durationPlayed"];

    if (!sortByOptions.includes(sort)) {
        throw new ApiError(400 , "Invalid sortBy query Input");
    }

    const queryObj = {};
    if (artist) {
        queryObj['artist'] = artist;
    }
    if (search) {
        queryObj['name'] = search;
    }

    return await Track.find(queryObj).skip((page - 1) * limit).limit(limit).sort(sort).populate({
        path: 'primaryArtist',
        select: 'username profilePicture bio followerCount'
    }). populate({
        path: 'artists',
        select: 'username profilePicture bio followerCount'
    });
}

export const allTracks = async (queries) => {
    
    const { page = 1, limit = 5, artist , search } = queries;

    const queryObj = {};
    if (artist) {
        queryObj['artist'] = artist;
    }
    if (search) {
        queryObj['name'] = search;
    }

    return await Track.find(queryObj).skip((page - 1) * limit).limit(limit).populate({
        path: 'primaryArtist',
        select: 'username profilePicture bio followerCount'
    }). populate({
        path: 'artists',
        select: 'username profilePicture bio followerCount'
    });
}

export const sortPlaylist = async (queries) => {
        
    const { page = 1, limit = 5, sort, search } = queries;

    const sortByOptions = ["playCount", "durationPlayed","-playCount", "-durationPlayed"];

    if (!sortByOptions.includes(sort)) {
        throw new ApiError(400 , "Invalid sortBy query Input");
    }

    const queryObj = {};
    if (search) {
        queryObj['name'] = search;
    }

    return await Playlist.find(queryObj).skip((page - 1) * limit).limit(limit).sort(sort).populate({
        path: 'primaryArtist',
        select: 'username profilePicture bio followerCount'
    }). populate({
        path: 'artists',
        select: 'username profilePicture bio followerCount'
    });
}

export const allPlaylist = async (queries) => {
    
    const { page = 1, limit = 5, artist , search } = queries;

    const queryObj = {};
    if (artist) {
        queryObj['artist'] = artist;
    }
    if (search) {
        queryObj['name'] = search;
    }

    return await Playlist.find(queryObj).skip((page - 1) * limit).limit(limit).populate({
        path: 'primaryArtist',
        select: 'username profilePicture bio followerCount'
    }). populate({
        path: 'artists',
        select: 'username profilePicture bio followerCount'
    });
}