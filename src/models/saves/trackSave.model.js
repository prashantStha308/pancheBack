import mongoose, { Schema } from "mongoose";

const SavedTrackSchema = new Schema({
    track: {
        type: Schema.Types.ObjectId,
        ref: 'Track',
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

SavedTrackSchema.index({ track: 1, savedBy: 1 }, { unique: true });
const SavedTrack = mongoose.model('SavedTrack', SavedTrackSchema);

export default SavedTrack;