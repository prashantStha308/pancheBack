import Track from "../models/track.model.js";
import { ApiError } from "../utils/ApiError.js";
import { handleImageUploads } from "../utils/helper.js";

export const createPlaylist = async (req, res, next) => {
    let coverArtId, backgroundId;
    try {
        const body = req.body;
        const files = req.files;

        if (!Array.isArray(body.trackList) || body.trackList.length < 1) {
            throw new ApiError(400, "body.trackList must be an array containing atleast 1 track._id");
        }

        const artists = await Promise.all(
            body.trackList.map(async (item) => {
                const artist = await Track.findById(item).populate({
                path: 'artists',
                select: '_id'
                });
                return artist;
            })
        );

        const { coverArt, backgroundArt } = await handleImageUploads(files);
        coverArtId = coverArt.publicId;
        backgroundId = backgroundArt.publicId !== coverArt.publicId ? backgroundArt.publicId : null;

    } catch (error) {
        
    }
}