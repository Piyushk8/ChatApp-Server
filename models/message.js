import mongoose, { model, Schema } from "mongoose";
const MessageSchema =new Schema ({
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true

    },
    chat:{
        type:Schema.Types.ObjectId,
        ref:"Chat",
        required:true
    },
    content:String,
    attachments: [
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
        
    },{timestamps:true});



export const Message =    model("Message" , MessageSchema)