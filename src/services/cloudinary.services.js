import { Readable } from "stream";
import cloudinary from "../config/cloudinary.config.js";

export const uploadToCloudinary = (fileBuffer, folder, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        // Create a stream from the buffer
        const stream = Readable.from(fileBuffer);

        // Create upload stream to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                type: 'private',
                resource_type: resourceType
            },
            (error, res) => {
                if (error) {
                    return reject(error);
                }
                resolve(res);
            }
        );

        // Pipe the file buffer to the upload stream
        stream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async ( publicId , resourceType ) => {
    try {
        const res = await cloudinary.uploader.destroy( publicId , { resource_type: resourceType } );
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const buildCloudinaryUrl = (publicId, expiryTime) => {

    if (!publicId) {
        console.error("No publicId set");
        return null;
    }

    publicId = "track/" + publicId;

    return cloudinary.url( publicId, {
        resource_type: 'video',
        type: 'upload',
        sign_url: true,
        // auth_token: {
        //     duration: expiryTime || 3600
        // }
    })
}