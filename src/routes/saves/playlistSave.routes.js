import express from "express";
import { getAllPlaylistSaves, togglePlaylistSave } from "../../controllers/saves/playlistSave.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const playlistSaveRouter = express.Router();

playlistSaveRouter.post('/:playlistId', authenticate, togglePlaylistSave);
playlistSaveRouter.get('/', authenticate, getAllPlaylistSaves);

export default playlistSaveRouter;