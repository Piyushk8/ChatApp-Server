
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import { v4 as uuid } from 'uuid';
import { v2 as cloudinary } from "cloudinary";
import { getBase64 } from "../lib/helper.js";

const cookieOption = {
    maxAge:1000*60*60*24*15,sameSite:"none",
    httpOnly:true,
    secure:true
};
//to connect to mongodb database
const connectDB = (uri) => {
    mongoose
      .connect(uri)
      .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
      .catch((err) => {
        throw err;
      });
  };
  
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

const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) {
            console.error("Upload Error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    console.error("Upload Failed:", err);
    throw err;
  }
};

const deleteFileCloudinary = async(public_ids)=>{
    ///
    }

export {connectDB,uploadFilesToCloudinary, sendToken ,emitEvent,deleteFileCloudinary}