import mongoose from "mongoose";
import Track from "../models/track.model.js";
import { uploadToCloudinary } from "../services/cloudinary.services.js";
import { ApiError } from "./ApiError.js";

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
    // Template for backgroundArt Object
    let backgroundArt = {
        src: "",
        publicId: null
    }

    if (files.backgroundArt) { //upload image if backgroundFile is provided
        const bgRes = await uploadToCloudinary(files.backgroundArt[0].buffer, 'image', 'image');
        backgroundArt.src = bgRes.secure_url;
        backgroundArt.publicId = bgRes.public_id;
        bgId = bgRes.public_id;
    } else { //else backgroundArt is same as coverArt
        backgroundArt = {...coverArt};
    }
    
    return { audio , coverArt , backgroundArt }
}

export const handleImageUploads = async (file) => {

    let coverArt = {
        src: "https://res.cloudinary.com/dww0antkw/image/upload/v1747984790/deafultImg_woxk8f.png",
        publicId: ""
    };

    if (file) {
        const imgRes = await uploadToCloudinary(file[0].buffer, 'image', 'image');
        coverArt = {
            src: imgRes.secure_url,
            publicId:  imgRes.public_id
        };
    }
    
    return coverArt;
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