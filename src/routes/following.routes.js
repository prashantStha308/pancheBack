import express from "express";
import { getAllFollowers, getAllFollowings, toggleFollow } from "../controllers/following.controller.js";
import { authorize } from "../middleware/authorize.js"
import { sanitizeBasicQuery ,sanitizeFollowingParams } from "../middleware/sanitizor.js";

const followingRouter = express.Router();

// http://localhost:5000/api/following/{endpoint}

followingRouter.post('/:receiverId', authorize(['user' , 'artist' , 'admin']) , sanitizeFollowingParams , toggleFollow);
followingRouter.get('/me/followers/', authorize(['user' , 'artist' , 'admin']) , sanitizeBasicQuery , getAllFollowers);
followingRouter.get('/me', authorize(['user' , 'artist' , 'admin']), sanitizeBasicQuery , getAllFollowings);

export default followingRouter;