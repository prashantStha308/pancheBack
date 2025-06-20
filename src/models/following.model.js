import mongoose, { Schema } from "mongoose";

const FollowingSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

const Following = mongoose.model('Following', FollowingSchema);
export default Following;