import { config } from "dotenv";

config();

export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
// JWT
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

// Cloudinary

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_ENV_VARIABLE = process.env.CLOUDINARY_ENV_VARIABLE;