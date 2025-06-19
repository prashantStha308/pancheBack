import express from "express";
import { config } from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";
import validator from "express-validator"

// Read docs on express-validator

// Routes imports
import trackRouter from "./routes/track.routes.js";

config();
const PORT = process.env.PORT;

const app = express();

app.use(express.json({limit: '16kb'}));
app.use(cors());

// Routes
app.use('/api/track', trackRouter);

app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`);
    connectDb();
})