import mongoose, { Schema } from "mongoose";

const SavedPlaylistSchema = new Schema({
    resource: {
        type: Schema.Types.ObjectId,
        ref: 'Playlist',
        required: true
    },
    savedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

SavedPlaylistSchema.index({ resource: 1, savedBy: 1 }, { unique: true });
const SavedPlaylist = mongoose.model('SavedPlaylist', SavedPlaylistSchema);

export default SavedPlaylist;