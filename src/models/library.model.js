import { Schema } from "mongoose";

const LibrarySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    savedTracks: [{
        
    }]
})
// ...banaune ra?? better make a document diagram before proceeding