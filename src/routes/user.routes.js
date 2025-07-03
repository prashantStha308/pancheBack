import express from "express";
import { createUser, deleteUser, getAllUsers, getUserDetails, loginUser, updateUser, userDetailsById } from "../controllers/user.controller.js";
import upload from "../config/multer.config.js";
import { authorize } from "../middleware/authorize.js";
import { getAllArtists } from "../controllers/artist.controller.js";

const userRouter = express.Router();

userRouter.post('/', upload.fields([
    { name: 'coverArt', maxCount: 1 },
    { name: 'profilePicture' , maxCount: 1 }
]) ,createUser);

userRouter.post('/login', loginUser);
userRouter.get('/me', authorize , getUserDetails);

userRouter.get('/', getAllUsers);
userRouter.get('/:userId', userDetailsById);

userRouter.delete('/me/delete', authorize, deleteUser);

userRouter.patch('/me/update', authorize, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverArt', maxCount: 1 }
]), updateUser);

// artists
userRouter.get('/artists', getAllArtists);

export default userRouter;