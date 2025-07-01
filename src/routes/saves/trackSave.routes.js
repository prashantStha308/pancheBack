import express from "express";
import { getAlltrackSaves, toggletrackSave } from "../../controllers/saves/trackSave.controller.js";
import { authorize } from "../../middleware/authorize.js";

const trackSaveRouter = express.Router();

trackSaveRouter.post('/:trackId', authorize ,toggletrackSave);
trackSaveRouter.get('/', authorize , getAlltrackSaves);

export default trackSaveRouter;