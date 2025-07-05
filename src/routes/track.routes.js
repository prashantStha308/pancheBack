import express from "express";
import upload from "../config/multer.config.js";
// Controllers and services
import {
    createTrack,
    getAllTracks,
    getTrackById,
    deleteTrackById,
    updateTrackById,
    updatePlayCount
} from "../controllers/track.controller.js";
import { streamAudio } from "../services/stream.services.js";
// Middlewares
import {authorize} from "../middleware/authorize.js";
import { sanitizeAndValidateTrackBody, sanitizeTrackQuery, sanitizeTrackParams } from "../middleware/sanitizor.js";


const trackRouter = express.Router();

// Create Track
trackRouter.post('/', authorize(['artist' , 'admin']) , upload.fields([
    { name: 'coverArt', maxCount: 1 },
    { name: 'track', maxCount: 1 },
]), sanitizeAndValidateTrackBody ,createTrack);
// Get All tracks
trackRouter.get('/', sanitizeTrackQuery , getAllTracks);
// Get tracks by Id
trackRouter.get('/:trackId', sanitizeTrackParams , getTrackById);
// Update Track
trackRouter.patch('/:trackId', upload.single('profilePicture'), authorize(['artist', 'admin']), sanitizeTrackParams ,sanitizeAndValidateTrackBody, updateTrackById);
// Delete Track
trackRouter.delete('/:trackId', authorize(['artist' , 'admin']), sanitizeTrackParams ,deleteTrackById);

trackRouter.patch('/playcount/:trackId', authorize(['artist' , 'admin']), sanitizeTrackParams , sanitizeAndValidateTrackBody ,  updatePlayCount);

// stream
trackRouter.get('/:trackId/stream', authorize(['user' , 'artist' , 'admin']) , sanitizeTrackParams , streamAudio);

export default trackRouter;