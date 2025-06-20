import express from "express";
import { createUser, deleteUser, getAllUsers, loginUser, userDetails } from "../controllers/user.controller.js";
import upload from "../config/multer.config.js";

const userRouter = express.Router();

userRouter.post('/', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPicture' , maxCount: 1 }
]) ,createUser);

userRouter.post('/login', loginUser);

userRouter.get('/:userId', userDetails);

userRouter.get('/', getAllUsers);

userRouter.delete('/:userId', deleteUser);

export default userRouter;