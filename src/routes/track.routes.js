import express from "express";
import { createTrack, getAllTracks } from "../controllers/track.controller.js";

const trackRouter = express.Router();

trackRouter.post('/', createTrack);
trackRouter.get('/', getAllTracks);


export default trackRouter;