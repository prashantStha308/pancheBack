import { uploadToCloudinary } from "../services/cloudinary.services.js";

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

export const handleImageUploads = async (files) => {

    let coverArt = {
        src: "",
        publicId: null
    };

    if (files.coverArt) {
        const imgRes = await uploadToCloudinary(files.coverArt[0].buffer, 'image', 'image');
        coverArt = {
            src: imgRes.secure_url,
            publicId:  imgRes.public_id
        };
    }

    let backgroundArt = {
        src: "",
        publicId: null
    }

    if (files.backgroundArt) {
        const imgRes = await uploadToCloudinary(files.backgroundArt[0].buffer, 'image', 'image');
        backgroundArt.src = imgRes.secure_url;
        backgroundArt.publicId = imgRes.public_id;
    } else {
        backgroundArt = { ...coverArt }
    }
    
    return { coverArt, backgroundArt };
}