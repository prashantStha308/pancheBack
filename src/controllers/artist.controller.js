import User from "../models/user.model.js";

export const getAllArtists = async (req, res, next) => {
    let { page = 1, limit = 10 } = req.query;
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    const artists = await User.find({ role: 'artist' }).select('-password -location -dob -subscription -trackList -playLists');

}