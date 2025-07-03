import express from "express";
import { getAllFollowers, getAllFollowings, toggleFollow } from "../controllers/following.controller.js";
import {authorize} from "../middleware/authorize.js"

const followingRouter = express.Router();

// http://localhost:5000/api/following/{endpoint}

followingRouter.post('/:receiverId', authorize, toggleFollow);
followingRouter.get('/followers/', authorize , getAllFollowers);
followingRouter.get('/me', authorize , getAllFollowings);

export default followingRouter;