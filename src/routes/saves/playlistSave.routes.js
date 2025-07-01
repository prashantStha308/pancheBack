import express from "express";
import { getAllPlaylistSaves, togglePlaylistSave } from "../../controllers/saves/playlistSave.controller.js";
import { authorize } from "../../middleware/authorize.js";

const playlistSaveRouter = express.Router();

playlistSaveRouter.post('/:playlistId', authorize, togglePlaylistSave);
playlistSaveRouter.get('/', authorize, getAllPlaylistSaves);

export default playlistSaveRouter;