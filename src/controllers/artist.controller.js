import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getAllArtists = async (req, res, next) => {
    let { page = 1, limit = 10 , city , country } = req.query;
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    const queryObj = { role: 'artist' };
    if (city) {
        queryObj['location.city'] = city;
    }
    if (country) {
        queryObj['location.country'] = country;
    }

    const artists = await User.find(queryObj).select('-password -email -location -dob -subscription -trackList -playLists').skip((page - 1) * limit).limit(limit);
    
    res.status(200).json(new ApiResponse(200, "Fetched artists successfully", artists));

}