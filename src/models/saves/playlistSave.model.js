import mongoose, { Schema } from "mongoose";

const SavedPlaylistSchema = new Schema({
    playlist: {
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

SavedPlaylistSchema.index({ playlist: 1, savedBy: 1 }, { unique: true });
const SavedPlaylist = mongoose.model('SavedPlaylist', SavedPlaylistSchema);

export default SavedPlaylist;