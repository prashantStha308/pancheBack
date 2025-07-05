import express from "express";
import { getAlltrackSaves, toggletrackSave } from "../../controllers/saves/trackSave.controller.js";
import { authorize } from "../../middleware/authorize.js";
import { sanitizeTrackParams , sanitizeBasicQuery } from "../../middleware/sanitizor.js";

const trackSaveRouter = express.Router();

trackSaveRouter.post('/:trackId', authorize(['user' , 'artist' , 'admin']) , sanitizeTrackParams , toggletrackSave);
trackSaveRouter.get('/', authorize(['user' , 'artist' , 'admin']) , sanitizeBasicQuery , getAlltrackSaves);

export default trackSaveRouter;