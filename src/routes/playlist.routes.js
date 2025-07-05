// Configs
import express from "express";
import upload from "../config/multer.config.js";
// Controllers
import {
    createPlaylist,
    getAllPlaylist,
    getPlaylistById,
    addTrackToPlaylist,
    updatePlaylistById,
    updatePlayCount,
    deletePlaylistById,
    updateTotalPlayDuration
} from "../controllers/playlist.controller.js";
// Middlewares
import { authorize } from "../middleware/authorize.js";
import { sanitizeAndValidatePlaylistBody, sanitizePlaylistQuery , sanitizePlaylistParams } from "../middleware/sanitizor.js";

// Router
const playlistRouter = express.Router();

// Routes

// Create playlist
playlistRouter.post('/', upload.single('coverArt'),authorize(['user', 'artist', 'admin']),sanitizeAndValidatePlaylistBody,createPlaylist);
// Get All playlist
playlistRouter.get('/',sanitizePlaylistQuery,getAllPlaylist);
// Get playlist by Id
playlistRouter.get('/:playlistId', sanitizePlaylistParams ,  getPlaylistById);
// delete playlist by Id
playlistRouter.delete('/:playlistId',authorize(['user', 'artist', 'admin']), sanitizePlaylistParams ,deletePlaylistById );
// update playlist by Id
playlistRouter.patch('/:playlistId',upload.single('coverArt'),authorize(['user', 'artist', 'admin']), sanitizePlaylistParams , sanitizeAndValidatePlaylistBody,updatePlaylistById);
// add track to playlist
playlistRouter.patch('/addTrack/:playlistId', authorize(['user', 'artist', 'admin']),  sanitizePlaylistParams , sanitizeAndValidatePlaylistBody, addTrackToPlaylist);
// update playcount
playlistRouter.patch('/playCount/:playlistId', authorize(['user', 'artist', 'admin']),  sanitizePlaylistParams , sanitizeAndValidatePlaylistBody, updatePlayCount);
// update total play duration
playlistRouter.patch('/playDuration/:playlistId',authorize(['user', 'artist', 'admin']), sanitizePlaylistParams , sanitizeAndValidatePlaylistBody,updateTotalPlayDuration);

export default playlistRouter;