import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: [3, 'user.username must be at least 3 characters long'],
        maxlength: [30, 'user.username cannot exceed 30 characters'],
    },
    fullName: {
        type: String,
        trim: true,
        unique: true,
        minlength: [3, 'user.fullName must be at least 3 characters long'],
        maxlength: [30, 'user.fullName cannot exceed 30 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email"
        }
    },
    password: {
        type: String,
        required: [true, 'user.password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    profilePicture: {
        type: String,
        default: "https://res.cloudinary.com/dww0antkw/image/upload/v1747984790/deafultImg_woxk8f.png",
        validate: {
            validator: validator.isURL,
            message: "Please input a valid url"
        }
    },
    bio: {
        type: String,
        deafult: "Artist hasn't yet added a description in bio",
        maxlength: [150, 'user.bio cannot exceed 150 characters'],
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
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    followingCount: {
        type: Number,
        default: 0
    },
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    playlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Playlist'
    }]
},
{
    timestamps: true
})

const User = mongoose.model('User', UserSchema);

export default User;