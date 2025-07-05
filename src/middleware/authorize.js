import { JWT_SECRET } from "../config/env.config.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const authorize = (allowedRoles) => {
   return async ( req , res , next ) => {
      try {
         const authHeader = req.headers['authorization'];
         const token = authHeader && authHeader.split(' ')[1];
         if (token == null) {
            return res.sendStatus(401);
         }
         
         jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);

            if (allowedRoles && !allowedRoles.includes(user.role)) {
               throw new ApiError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
            }

            req.user = user;
            next();
         })
      } catch (error) {
         next(error);
      }
   }
}