import { ApiError } from "../utils/ApiError.js";
import { buildCloudinaryUrl } from "./cloudinary.services.js";
import { Readable } from 'stream';

export const streamAudio = async (req, res , next) => {
    const { trackId } = req.params;
    const userId = req.user.id;
    const range = req.headers.range;

    if (!userId) {
        throw new ApiError(401, "Must authorize to access resource");
    }

    const cloudinaryUrl = buildCloudinaryUrl(trackId);
    console.log("Url: ",cloudinaryUrl);
    
    const headers = {};
    if (range) {
        headers['Range'] = range;
    }

    try {
        const response = await fetch(cloudinaryUrl, { headers });

         if (!response.ok) {
            throw new ApiError(response.status, "Failed to fetch data");
        }

        res.set({
            'Content-Range': response.headers.get('content-range'),
            'Accept-Ranges': response.headers.get('accept-ranges'),
            'Content-Length': response.headers.get('content-length'),
            'Content-Type': response.headers.get('content-type'),
            // Security
            'Content-Disposition': 'inline',
            'X-Content-Type-Options': 'nosniff'
        });

        if (response.status === 206) {
            res.status(206);
        }

        const nodeStream = Readable.fromWeb(response.body);
        nodeStream.pipe(res);

    } catch (error) {
        console.error('Streaming error:', error);
        next(error);
    }

}