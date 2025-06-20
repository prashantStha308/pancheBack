import mongoose, { Schema } from "mongoose";
import validator from "validator";
import { enumError, maxCharError, minCharError, requiredError, urlError} from "./errors.js";

const subscriptionType = ['premium', 'student', 'standard']
const userTypes = ['user', 'artist'];

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true ,  requiredError('user.username')],
        trim: true,
        unique: true,
        minlength: [3, minCharError('user.username',3)],
        maxlength: [30, maxCharError('user.username' , 30)],
    },
    fullName: {
        type: String,
        trim: true,
        unique: true,
        minlength: [3, minCharError('user.fullName',3)],
        maxlength: [30, maxCharError('user.fullName' , 30)],
    },
    email: {
        type: String,
        required: [true, requiredError('user.email')],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email"
        }
    },
    password: {
        type: String,
        required: [true,  requiredError('user.password')],
        minlength: [6, minCharError('user.password', 6)],
    },
    role: {
        type: String,
        lowercase: true,
        enum: {
            values: userTypes,
            message:  enumError('user.role' , userTypes )
        },
        default: 'user'
    },
    profilePicture: {
        src:{
            type: String,
            default: "https://res.cloudinary.com/dww0antkw/image/upload/v1747984790/deafultImg_woxk8f.png",
            validate: {
                validator: validator.isURL,
                message:  urlError('user.profilePicture.src')
            }
        },
        publicId:{
            type: String,
            default: ""
        }
    },
    coverPicture: {
        src:{
            type: String,
            default: "https://res.cloudinary.com/dww0antkw/image/upload/v1747984790/deafultImg_woxk8f.png",
            validate: {
                validator: validator.isURL,
                message:  urlError('user.coverPicture.src')
            }
        },
        publicId:{
            type: String,
            default: ""
        }
    },
    bio: {
        type: String,
        deafult: "User hasn't yet added a bio",
        maxlength: [150,  maxCharError('user.bio' , 150)],
    },
    location: {
        country: {
            type: String,
            trim: true,
            lowercase: true,
            required: [true,  requiredError('user.location.country')]
        },
        state: {
            type: String,
            trim: true,
            lowercase: true,
        },
        province: {
            type: String,
            trim: true,
            lowercase: true,
        },
        city: {
            type: String,
            trim: true,
            lowercase: true,
        }
    },
    dob: {
        type: Date,
        // required: [ true ,  requiredError('user.dob') ],
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
    // you can make seperate model for saved tracks, tracklists , playlists haru, same for saves
    playlists: [{
        type: Schema.Types.ObjectId,
        ref: 'Playlist'
    }],
    trackList: [{
        type: Schema.Types.ObjectId,
        ref: 'Track'
    }],
    savedTracks: [{
        type: Schema.Types.ObjectId,
        ref: 'Track'
    }],
    subscription:{
        type: String,
        trim: true,
        lowercase: true,
        enum: {
            values: subscriptionType,
            message:  enumError('user.subscription' , subscriptionType)
        },
        default: 'standard'
    }
},
{
    timestamps: true
})

const User = mongoose.model('User', UserSchema);

export default User;