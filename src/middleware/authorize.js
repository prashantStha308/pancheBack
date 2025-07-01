import { JWT_SECRET } from "../config/env.config.js";
import jwt from "jsonwebtoken";

export const authorize = async (req, res, next) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];
   if (token == null) {
      return res.sendStatus(401);
   }
   
   jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
   })

}