import express from "express";
import upload from "../config/multer.config.js";
import { createPlaylist, getAllPlaylist, getPlaylistById , addTrackToPlaylist, updatePlaylistById, updatePlayCount, deletePlaylistById, updateTotalPlayDuration } from "../controllers/playlist.controller.js";
import authorize from "../middleware/authorize.js";

const playlistRouter = express.Router();

playlistRouter.post('/', upload.single('coverArt') , authorize , createPlaylist);

playlistRouter.get('/' , getAllPlaylist);
playlistRouter.get('/:playlistId' , getPlaylistById);

playlistRouter.delete('/:playlistId', authorize , deletePlaylistById);

playlistRouter.patch('/:playlistId', upload.single('coverArt'), updatePlaylistById);

playlistRouter.patch('/addTrack/:playlistId', authorize , addTrackToPlaylist);
playlistRouter.patch('/playCount/:playlistId', authorize , updatePlayCount);
playlistRouter.patch('/playDuration/:playlistId', authorize ,updateTotalPlayDuration);

export default playlistRouter;