import ErrorHandler from "../utils/utility.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken"

const AuthMiddleware  =TryCatch(async (req,res,next)=>{
//    console.log("reached! ",req.cookies.token)
    const tokenBearer = req.cookies.token
   
   if(!tokenBearer) return next(new ErrorHandler("Please login to access profile", 401))
    const token = tokenBearer.split(" ")[1]
    const success = jwt.verify(token,"JSON_SECRET")
    if(success) console.log("success")
    req.user = success._id;
    next();
    




})

export{ AuthMiddleware}