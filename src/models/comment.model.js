import mongoose, { Schema } from "mongoose";
import { requiredError } from "./errors";

const CommentSchema = new Schema({
    track: {
        type: Schema.Types.ObjectId,
        ref: 'Track',
        required: true
    },
    commentor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true , ()=> requiredError('comment.commentor')]
    },
    content: {
        type: String,
        required: [true , ()=> requiredError('comment.content')]
    },
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
})

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;