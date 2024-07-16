import mongoose, { model, Schema ,Types} from "mongoose";
const RequestSchema =new Schema ({
    sender:{
        type:Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        default:"pending",
        enum:["pending" , "rejected" , "accepted"]
    },
    receiver:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    }


});



export const Request = mongoosee.models.Request ||   model("Request" , RequestSchema)