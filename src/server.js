import express from "express";
import cors from "cors";
import { PORT } from "./config/env.config.js";
import connectDb from "./config/db.config.js";
// import validator from "express-validator"
// Read docs on express-validator

// Routes imports
import trackRouter from "./routes/track.routes.js";
import userRouter from "./routes/user.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import trackSaveRouter from "./routes/saves/trackSave.routes.js";
import playlistSaveRouter from "./routes/saves/playlistSave.routes.js";
import followingRouter from "./routes/following.routes.js";

const app = express();
// Middlewares
app.use(cors({
    origin: 'http://127.0.0.1:5500/frontend/index.html'
}));
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/track', trackRouter);
app.use('/api/user', userRouter);
app.use('/api/playlist', playlistRouter);
app.use('/api/save/track', trackSaveRouter);
app.use('/api/save/playlist', playlistSaveRouter);
app.use('/api/following' , followingRouter)

app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`);
    connectDb();
})