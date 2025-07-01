import { config } from "dotenv";

config();

export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;