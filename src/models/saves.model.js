import mongoose, { Schema } from "mongoose";
import { emptyError, enumError } from "./errors";

const resourceType  = ['Album', 'Playlist'];
const savedUserType = ['User', 'Artist'];

const SaveSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true , ()=>emptyError('saves.user')]
    },
    resource: {
        id:{
            type: Schema.Types.ObjectId,
            required: [true , ()=>emptyError('saves.resource.id')],
        },
        type:{
            type: String,
            enum: {
                values: resourceType,//Model names haru, to take reference while populating
                message: ()=>enumError('save.resource.type',resourceType )
            },
            required: [true,()=>emptyError('saves.resource.type')]
        }
    },
    saveCount: {
        type: Number,
        default: 0,
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
                values: savedUserType,
                message: ()=>enumError('save.savedBy.userType',savedUserType)
            },
        }
    }
})

SaveSchema.index({ user: 1, resource: 1 , savedBy: 1}, { unique: true });

const Save = mongoose.model('Save', SaveSchema);
export default Save;