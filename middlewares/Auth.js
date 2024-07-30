import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken"

const AuthMiddleware  =TryCatch(async (req,res,next)=>{
   console.log("reached! ",req.path)
    const tokenBearer = req.cookies.token
   
   if(!tokenBearer) return next(new ErrorHandler("Please login to access profile", 401))
    const token = tokenBearer.split(" ")[1]
    const success = jwt.verify(token,"JSON_SECRET")
    if(success) console.log("success")
    req.user = success._id;
    next();
    
})

const SocketAuthenticator = async(err,socket,next)=>{

    try{
        console.log("socket auhtntication")
        const tokenBearer = socket.request.cookies.token
   
        if(!tokenBearer) return next(new ErrorHandler("Please login to access profile", 401))
         const AuthToken = tokenBearer.split(" ")[1]
         
        const decodedData = jwt.verify(AuthToken ,"JSON_SECRET");
        const user = await User.findById(decodedData._id)
        
        if(!user)  return next(new ErrorHandler("Please Login to acess (no user found)",401))
        socket.user = user

     socket.user = {_id:"669806adbeadf0e0216870c8"}
        return next();

    }catch(error){
        console.log(error)
        return next(new ErrorHandler("Please Login to access",401))
    }

}


export{ AuthMiddleware ,SocketAuthenticator}