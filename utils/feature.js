
import mongoose, { mongo } from "mongoose";
import jwt from "jsonwebtoken"
const cookieOption = {
    maxAge:1000*60*60*24*15,sameSite:"none",
    httpOnly:true,
    secure:true
}
//to connect to mongodb database
const ConnectDB = (uri)=>{
    mongoose.connect((uri)).
    then(data=>{console.log(`connectd to db ${data.connection.host}`)})
    .catch((err)=>{throw err})

}
//to send jwt token to cookies
const sendToken = (res,user,code,message)=>{
    const token = jwt.sign({_id:user._id }, "JSON_SECRET")
    return res.status(code).cookie("token" ,"Bearer "+ token ,cookieOption).json({
        sucsess:true,
    message
    })
}

const emitEvent = (req,event,user,data)=>{
}

const deleteFileCloudinary = async(public_ids)=>{
    ///
    }

export {ConnectDB , sendToken ,emitEvent,deleteFileCloudinary}