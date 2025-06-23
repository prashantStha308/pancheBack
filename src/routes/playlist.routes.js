import express from "express";
import upload from "../config/multer.config.js";
import { createPlaylist, getAllPlaylist, getPlaylistById } from "../controllers/playlist.controller.js";

const playlistRouter = express.Router();

playlistRouter.post('/', upload.single('coverArt') , createPlaylist);
playlistRouter.get('/', getAllPlaylist);

playlistRouter.get('/:playlistId', getPlaylistById);

export default playlistRouter;