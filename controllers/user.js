
import bcrypt from "bcrypt"
import {User} from "../models/user.js"
import { sendToken } from "../utils/feature.js";
import ErrorHandler from "../utils/utility.js";
import { TryCatch }from "../middlewares/error.js"
const cookieOption = {
    maxAge:1000*60*60*24*15,sameSite:"none",
    httpOnly:true,
    secure:true
}


const login = TryCatch( async(req,res,next)=>{
    const password =req.body.password;

    const user = await User.findOne({
        username:req.body.username,
    }).select("+password");

    if(!user) return next(new ErrorHandler("Invalid userName" , 404))
   
//to check password 
    const isMatch = await bcrypt.compare(req.body.password ,user.password )

    if(!isMatch) {return next(new ErrorHandler("Inavalid Password" , 404))}


    sendToken(res , user  ,200,`welcome back ${user.name}`)

    })


    const newUser =TryCatch( async(req,res)=>{
console.log(req.body)
    
    const avatar= {public_id:"skjcnsk",url:"sojcns"};
  
  
 const user =  await User.create({
    avatar,
    username:req.body.username,
    name:req.body.name,
    password:req.body.password
  })
//used this to send token to cookies
  sendToken(res , user  ,200,"Token given")
})


const getMyProfile =TryCatch( async(req,res,next)=>{
    const id = req.user;

    const user = await User.findOne({
        _id:id
    })
    res.status(200).json({"name":user.name , "useranme":user.username})
})

const SearchUser = TryCatch(async(req,res,next)=>{
    const {name} =  req.query;

    
})



const Logout = TryCatch(
    async(req,res,next)=>{
        return res.status(200).cookie("token","",cookieOption).json({
            message:"LoggetOut succesfully!",
            success:true
        })
        next();
    }
)

export {login , newUser , getMyProfile, Logout , SearchUser}