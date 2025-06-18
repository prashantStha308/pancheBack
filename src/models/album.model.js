import mongoose, { Schema } from "mongoose";
import validator from 'validator';
import {emptyError, enumError, maxCharError, minEleError, requiredError, urlError} from "./errors.js";

const albumType = ['singles','ep','album'];
const visibilityType = ['public', 'private', 'unlisted'];

const validateArray = (value) => {
    return Array.isArray(value) && value.length >= 1;
}

const AlbumSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, ()=> emptyError('album.name')],
        maxlength: [50, ()=> maxCharError('album.name' , 50)]
    },
    type: {
        type: String,
        enum: {
            values: albumType,
            message: ()=> enumError('album.type',albumType)
        },
        default: 'album'
    },
    primaryArtist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        required: [true , ()=>requiredError('album.primaryArtist')]
    },
    artists: {
        type: [Schema.Types.ObjectId],
        ref: 'Artist',
        required: [true , ()=> requiredError('album.artist')],
        validate: {
            validator: validateArray,
            message: ()=> minEleError('album.artist' , 1)
        }
    },
    trackList: {
        type: [Schema.Types.ObjectId],
        ref: 'Track',
        required: true,
        validate: {
            validator: validateArray,
            message: ()=> minEleError('album.trackList' , 1)
        }
    },
    coverArt: {
        src: {
            type: String,
            required: [true , ()=> requiredError('coverArt.src')],
            validate: {
                validator: validator.isURL,
                message: urlError('album.coverArt.src')
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
            required: [true , ()=> requiredError('backgroundArt.src')],
            validate: {
                validator: validator.isURL,
                message: urlError('album.backgroundArt.src')
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
    visibility: {
        type: String,
        enum: {
            values: visibilityType,
            message: ()=> enumError('album.visibility',visibilityType)
        },
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