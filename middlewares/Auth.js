import ErrorHandler from "../utils/utility.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken"

const AuthMiddleware  =TryCatch(async (req,res,next)=>{

   const token = req.cookies.token.split(" ")[1]
   if(!token) return next(new ErrorHandler("Please login to access profile", 401))
    const success = jwt.verify(token,"JSON_SECRET")
    req.user = success._id;
    next();
    




})

export{ AuthMiddleware}