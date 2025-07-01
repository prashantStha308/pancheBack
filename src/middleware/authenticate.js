import { JWT_SECRET } from "../config/env.config.js";

export const authenticate = async (req , res , next) => {
    try {
      const authToken = req.header("auth-token");
      if(!authToken){
         return res.status(401).send({error: "Please authenticate using a valid token"});
      }
      const data = await jwt.verify(authToken, JWT_SECRET);
      req.user = data
      next();
   } catch (error) {
      return res.status(401).send({error: "Please authenticate using a valid token"});
   }
}