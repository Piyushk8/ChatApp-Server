import express from "express"
import { getMyProfile, login , newUser , Logout ,SearchUser} from "../controllers/user.js";
import {  singleAvatar } from "../middlewares/multer.js";
import { errorMiddleware} from "../middlewares/error.js";
import { AuthMiddleware } from "../middlewares/Auth.js";


const UserRouter = express.Router();
 
UserRouter.get("/login" , login,errorMiddleware)
UserRouter.post("/signup",singleAvatar,newUser,errorMiddleware)


//these routes require authentications
UserRouter.get("/me" ,AuthMiddleware, getMyProfile,errorMiddleware)
UserRouter.get("/logout",Logout)
UserRouter.get("/search",AuthMiddleware,SearchUser,errorMiddleware)
export default UserRouter;
