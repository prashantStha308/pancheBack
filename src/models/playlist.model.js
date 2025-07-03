import mongoose, { Schema } from "mongoose";
import validator from 'validator';
import {emptyError, enumError, maxCharError, minEleError, requiredError, urlError} from "./errors.js";

const playlistType = ['singles','ep','album','playlist'];
const visibilityType = ['public', 'private', 'unlisted'];

const PlaylistSchema = new Schema({
    name: {
        type: String,
        required: [true ,  requiredError('playlist.name')],
        trim: true,
        minlength: [1,  emptyError('playlist.name')],
        maxlength: [50,  maxCharError('playlist.name' , 50)]
    },
    type: {
        type: String,
        enum: {
            values: playlistType,
            message:  enumError('playlist.type',playlistType)
        },
        required: [true , requiredError('playlist.type')]
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    primaryArtist: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    artists: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    trackList: [{
        type: Schema.Types.ObjectId,
        ref: 'Track',
        required: true,
    }],
    coverArt: {
        src: {
            type: String,
            required: [true ,  requiredError('playlist.coverArt.src')],
            validate: {
                validator: validator.isURL,
                message: urlError('playlist.coverArt.src')
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
        enum: {
            values: visibilityType,
            message:  enumError('playlist.visibility',visibilityType)
        },
        default: 'public'
    },
    totalDuration: {
        type: Number,
        default: 0
    },
    durationPlayed: {
        type: Number,
        default: 0
    },
    playCount: {
        type: Number,
        deafult: 0
    }
}, {
    timestamps: true
});


const updateArtists = async function (next){
    if (!this.isModified('trackList')) {
        return next();
    }
    try {
        const tracks = await mongoose.model('Track').find({ _id: { $in: this.trackList } }, 'artists');

        const allArtists = new Set();
        for (const track of tracks) {
            track.artists.forEach(artistId => allArtists.add(artistId.toString()));
        }

        this.artists = Array.from(allArtists);
        next();
    } catch (err) {
        next(err);
    }
}

PlaylistSchema.pre('save', updateArtists);

const Playlist = mongoose.model('Playlist', PlaylistSchema);
export default Playlist;