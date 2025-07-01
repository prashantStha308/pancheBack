import express from "express";
import { createUser, deleteUser, getAllUsers, getUserDetails, loginUser, userDetails } from "../controllers/user.controller.js";
import upload from "../config/multer.config.js";
import { authorize } from "../middleware/authorize.js";

const userRouter = express.Router();

userRouter.post('/', upload.fields([
    { name: 'coverArt', maxCount: 1 },
    { name: 'backgroundArt' , maxCount: 1 }
]) ,createUser);

userRouter.post('/login', loginUser);
userRouter.get('/me', authorize , getUserDetails);

userRouter.get('/:userId', userDetails);

userRouter.get('/', getAllUsers);

userRouter.delete('/:userId', deleteUser);

export default userRouter;