import mongoose, { Schema } from "mongoose";

const SaveSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resourceId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    resource: {
        type: String,
        enum: ['Album', 'Playlist'], //Model names haru, to take reference while populating
        required: true
    },
    saveCount: {
        type: Number,
        default: 0
    },
    savedBy: {
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        userType: {
            type: String,
            required: true,
            enum: {
                values: ['User', 'Artist'],
                message: "save.savedBy.userType must be either 'User' or 'Artist'"
            },
        }
    }
})

SaveSchema.index({ user: 1, resource: 1, resourceId: 1 }, { unique: true });

const Save = mongoose.model('Save', SaveSchema);
export default Save;