import mongoose, { Schema } from "mongoose";
import { emptyError, enumError, maxCharError, requiredError, urlError } from "./errors.js";
import validator from "validator";

const visibilityType = ['public', 'private', 'unlisted'];

const TrackSchema = new Schema({
    name: {
        type: String,
        required: [true, requiredError('track.name')],
        lowercase: true,
        trim: true,
        minlength: [1, emptyError('track.name')],
        maxlength: [50 , maxCharError('track.name' , 50)]
    },
    primaryArtist: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true ,requiredError('track.primaryArtist')]
    },
    artists: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    coverArt: {
        src: {
            type: String,
            required: [true , requiredError('coverArt.src')],
            validate: {
                validator: validator.isURL,
                message: urlError('playlist.coverArt.src')
            }
        },
        publicId: {
            type: String,
            default: ""
        }
    },
    audio: {
        src: {
            type: String,
            required: [true, requiredError('track.audio.src')],
            validate: {
                validator: validator.isURL,
                message: urlError('track.audio.src')
            }
        },
        publicId: {
            type: String,
            required: [true, requiredError('track.audio.publicId')],
        }
    },
    totalDuration: {
        type: Number,
        required: true
    },
    visibility: {
        type: String,
        enum: {
            values: visibilityType,
            message:  enumError('track.visibility' , visibilityType)
        },
        default: 'public'
    },
    genre: [{
        type: String,
    }],
    playCount: {
        type: Number,
        default: 0
    },
    durationPlayed: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
})

const Track = mongoose.model('Track', TrackSchema);
export default Track;