import express from "express";
import upload from "../config/multer.config.js";
import { createTrack, getAllTracks , getTrackById , deleteTrackById , updateTrackById } from "../controllers/track.controller.js";

const trackRouter = express.Router();

trackRouter.post('/', upload.fields([
    { name: 'coverArt', maxCount: 1 },
    { name: 'track', maxCount: 1 },
    { name: 'backgroundArt', maxCount: 1 }
]), createTrack);

trackRouter.get('/', getAllTracks);
trackRouter.get('/:trackId', getTrackById);

trackRouter.patch('/:trackId', upload.single('profilePicture'), updateTrackById);
trackRouter.delete('/:trackId', deleteTrackById);

export default trackRouter;