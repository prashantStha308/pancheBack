import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
    track: {
        type: Schema.Types.ObjectId,
        ref: 'Track',
        required: true
    },
    commentor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: 'true'
    },
    likes: {
        type: Number,
        default: 0
    }
})

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;