import mongoose, { Schema } from "mongoose";
import validator from 'validator';

const ArtistSchema = new Schema({
    name: {
        type: String,
        required: [true, 'artist.name is required'],
        trim: true,
        minlength: [3, 'artist.name must be at least 3 characters long'],
        maxlength: [30, 'artist.name cannot exceed 30 characters'],
    },
    fullName: {
        type: String,
        trim: true,
        unique: true,
        minlength: [3, 'artist.fullName must be at least 3 characters long'],
        maxlength: [30, 'artist.fullName cannot exceed 30 characters'],
    },
    email: {
        type: String,
        required: [true, 'artist.email is required'],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email"
        }
    },
    password: {
        type: String,
        required: [true, 'artist.password is required'],
    },
    profilePicture: {
        src: {
            type: String,
            default: "https://res.cloudinary.com/dww0antkw/image/upload/v1747984790/deafultImg_woxk8f.png",
            validate: {
                validator: validator.isURL,
                message: "Invalid url in artist.profilePicture"
            }
        },
        publicId: {
            type: String,
            default: ""
        }
    },
    bio: {
        type: String,
        deafult: "Artist hasn't yet added a description in bio",
        maxlength: [150, 'artist.bio cannot exceed 100 characters'],
    },
    location: {
        country: {
            type: String,
            required: true
        },
        state: {
            type: String
        },
        province: {
            type: String
        },
        city: {
            type: String
        }
    },
    dob: {
        type: Date,
        validate: {
            validator: function(value) {
                // Ensure the user is at least 13 years old
                const ageLimit = 13;
                const birthDate = new Date(value);
                const currentDate = new Date();
                const age = currentDate.getFullYear() - birthDate.getFullYear();
                return age >= ageLimit;
            },
            message: 'You must be at least 13 years old',
        },
    },
    followersCount: {
        type: Number,
        default: 0
    },
    followers: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    },
    followingCount: {
        type: Number,
        default: 0
    },
    following: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    },
    trackList: {
        type: [Schema.Types.ObjectId],
        ref: 'Track',
    },
    albums: {
        type: [Schema.Types.ObjectId],
        ref: 'Playlist'
    }
},
{
    timestamps: true
});

const Artist = mongoose.model('Artist', ArtistSchema);
export default Artist;