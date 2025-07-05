import express from "express";
import { getAllPlaylistSaves, togglePlaylistSave } from "../../controllers/saves/playlistSave.controller.js";
import { authorize } from "../../middleware/authorize.js";
import { sanitizePlaylistParams } from "../../middleware/sanitizor.js";

const playlistSaveRouter = express.Router();

playlistSaveRouter.post('/:playlistId', authorize(['user' , 'artist' , 'admin']), sanitizePlaylistParams, togglePlaylistSave);
playlistSaveRouter.get('/', authorize(['user' , 'artist' , 'admin']), getAllPlaylistSaves);

export default playlistSaveRouter;