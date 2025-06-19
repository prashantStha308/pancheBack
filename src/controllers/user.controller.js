import User from "../models/user.model";
import { uploadToCloudinary } from "../services/cloudinary.services";
import { ApiError } from "../utils/ApiError";

export const createUser = async (req, res, next) => {
    let profileId;
    try {
        const body = req.body;

        if (!body.username || !body.fullname || !body.email || !body.password) {
            throw new ApiError(400, 'Required Feilds not filled');
        }

        if (req.file) {
            const imgRes = await uploadToCloudinary(req.file[0].buffer, 'image', 'image');
            profileId = imgRes.public_id;
            var profilePicture = {
                src: imgRes.secure_url,
                publicId: profileId
            }
        }
        
        const user = await User.create({
            ...body,
            profilePicture
        })

    } catch (error) {
        
    }
}