import express from "express";
import { getAlltrackSaves, toggletrackSave } from "../../controllers/saves/trackSave.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const trackSaveRouter = express.Router();

trackSaveRouter.post('/:trackId', authenticate ,toggletrackSave);
trackSaveRouter.get('/', authenticate , getAlltrackSaves);

export default trackSaveRouter;