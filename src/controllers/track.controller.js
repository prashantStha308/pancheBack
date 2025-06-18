import Track from "../models/track.model";
import { deleteFromCloudinary, uploadToCloudinary } from "../services/cloudinary.services";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parseBuffer } from "music-metadata";

export const createTrack = async (req, res, next) => {
    let audioId, coverId, bgId;
    try {
        const { name , primaryArtist , visibility , artists=[] , genre=[] } = req.body;
        const coverArtFile = req.files.coverArt[0] || null;
        const trackFile = req.files.trackFile[0] || null;
        const backgroundFile = req.files.background[0] || null;

        if (!name || !primaryArtist || !visibility) {
            return next(new ApiError(400, 'Required fields not submitted'));
        }

        if (!coverArtFile) { return next(new ApiError(400, 'Missing coverArt')) };
        if (!trackFile) { return next(new ApiError(400, 'Missing Audio file')) };

        // Upload audio and image files
        const [trackRes, imgRes] = await Promise.all([uploadToCloudinary(trackFile.buffer, 'track', 'video'), uploadToCloudinary(coverArtFile.buffer, 'image', 'image')]);

        // create audio object
        audioId = trackRes.public_id
        const audio = {
            src: trackRes.secure_url,
            publicId: audioId
        };
        // create coverArt object
        coverId = imgRes.public_id;
        const coverArt = {
            src: imgRes.secure_url,
            publicId: coverId
        };
        // Template for backgroundArt Object
        let backgroundArt = {
            src: "",
            publicId: ""
        }

        if (backgroundFile) { //upload image if backgroundFile is provided
            const bgRes = await uploadToCloudinary(backgroundFile.buffer, 'image', 'image');
            backgroundArt.src = bgRes.secure_url;
            backgroundArt.publicId = bgRes.public_id;
            bgId = bgRes.public_id;
        } else { //else backgroundArt is same as coverArt
            backgroundArt = {...coverArt};
        }

        const musicMetadata = await parseBuffer(trackFile.buffer, 'audio/mpeg');
        const totalDuration = musicMetadata.format.duration;

        const track = await Track.create({
            name,
            primaryArtist,
            artists,
            coverArt,
            backgroundArt,
            audio,
            visibility,
            totalDuration,
            genre
        })

        if (!track) {
            throw new Error("Something went wrong while creating track");
        }

        res.status(201).json(new ApiResponse(201, 'Track Created Successfully', track));

    } catch (error) {

        if (audioId) await deleteFromCloudinary(audioId, 'video');
        if (coverId) await deleteFromCloudinary(coverId, 'image');
        if (bgId) await deleteFromCloudinary(bgId, 'image');

        return next(new ApiError(500, error.message));
    }
}

export const getAllTracks = async ( req ,res , next ) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));

        const trackRes = await Track.find({}).skip( ( page - 1 ) * limit ).limit(limit);
    } catch (error) {
        
        return new ApiError(500, `Something went wrong with error: ${error} `);
    }
}