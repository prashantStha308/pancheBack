import mongoose, { Schema } from "mongoose";
import validator from 'validator';

const validateArray = (value) => {
    return Array.isArray(value) && value.length >= 1;
}

const AlbumSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'album.name cannot be empty'],
        maxlength: [50, 'album.name cannot exceed 50 characters']
    },
    type: {
        type: String,
        enum: ['singles','ep','album'],
        default: 'album'
    },
    primaryArtist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },
    artists: {
        type: [Schema.Types.ObjectId],
        ref: 'Artist',
        required: true,
        validate: {
            validator: validateArray,
            message: "playlist.artists must be an array containing at least 1 element"
        }
    },
    trackList: {
        type: [Schema.Types.ObjectId],
        ref: 'Track',
        validate: {
            validator: validateArray,
            message: "playlist.trackList must be an array containing at least 1 element"
        }
    },
    coverArt: {
        src: {
            type: String,
            required: true,
            validate: {
                validator: validator.isURL,
                message: "Please input a valid URL"
            }
        },
        publicId: {
            type: String,
        }
    },
    backgroundArt: {
        src: {
            type: String,
            required: true,
            validate: {
                validator: validator.isURL,
                message: "Please input a valid URL"
            }
        },
        publicId: {
            type: String,
        }
    },
    description: {
        type: String,
        default: "" 
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'public'
    },
    saveCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    totalDuration: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const Album = mongoose.model('Album', AlbumSchema);
export default Album;