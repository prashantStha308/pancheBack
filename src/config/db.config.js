import mongoose from "mongoose";
import { MONGODB_URI } from "./env.config.js"; 


const connectDb = async()=>{
    try {
        console.log("Connnecting to mongodb");
        const conn = await mongoose.connect(MONGODB_URI)
        console.log(`Successfully connected to ${conn.connection.host}`);
    } catch (error) {
        console.log("MongoDB not connected. Error: ", error.messsage);
        process.exit();
    }
}

export default connectDb;