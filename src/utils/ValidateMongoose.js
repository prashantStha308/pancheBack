import mongoose from "mongoose";

const validateMongoose = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}

export default validateMongoose;