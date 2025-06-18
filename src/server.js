import express from "express";
import { config } from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";

config();
const PORT = process.env.PORT;

const app = express();

app.use(express.json({limit: '16kb'}));
app.use(cors());

app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`);
    connectDb();
})