import mongoose, { Collection, Schema } from "mongoose";
import validator from 'validator';

const validateArray = (value) => {
    return Array.isArray(value) && value.length >= 1;
}

const PlaylistSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'playlist.names must have at least 3 characters'],
        maxlength: [50, 'playlist.names cannot exceed 50 characters']
    },
    type: {
        type: String,
        enum: ['playlist'],
        default: 'playlist'
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
        required: true,
        validate: {
            validator: validateArray,
            message: "playlist.trackList must be an array containing at least 1 element"
        }
    },
    coverArt: {
        src: {
            type: String,
            default: "https://res.cloudinary.com/dww0antkw/image/upload/v1747984790/deafultImg_woxk8f.png",
            validate: {
                validator: validator.isURL,
                message: "Please input a valid url"
            }
        },
        publicId: {
            type: String,
            default: ""
        }
    },
    backgroundArt: {
         src: {
            type: String,
            default: "https://res.cloudinary.com/dww0antkw/image/upload/v1747984790/deafultImg_woxk8f.png",
            validate: {
                validator: validator.isURL,
                message: "Please input a valid url"
            }
        },
        publicId: {
            type: String,
            default: ""
        }
    },
    description: {
        type: String,
        default: ""
    },
    visibility:{
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
        default: 0,
    }
}, {
    timestamps: true
})

const Playlist = mongoose.model('Playlist', PlaylistSchema);

export default Playlist;