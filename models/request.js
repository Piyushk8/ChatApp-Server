import mongoose, { model, Schema} from "mongoose";
const RequestSchema =new Schema ({
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        default:"pending",
        enum:["pending" , "rejected" , "accepted"]
    },
    receiver:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }


});



export const Request =   model("Request" , RequestSchema)