import express from "express";
import upload from "../config/multer.config.js";
import { createTrack, getAllTracks , getTrackById , deleteTrackById , updateTrackById } from "../controllers/track.controller.js";
import authorize from "../middleware/authorize.js";
import { updatePlayCount } from "../controllers/playlist.controller.js";


const trackRouter = express.Router();

trackRouter.post('/', authorize , upload.fields([
    { name: 'coverArt', maxCount: 1 },
    { name: 'track', maxCount: 1 },
]), createTrack);

trackRouter.get('/', getAllTracks);
trackRouter.get('/:trackId', getTrackById);

trackRouter.patch('/:trackId', authorize , upload.single('profilePicture'), updateTrackById);
trackRouter.delete('/:trackId', authorize, deleteTrackById);

trackRouter.patch('/playcount/:trackId', authorize , updatePlayCount);

export default trackRouter;