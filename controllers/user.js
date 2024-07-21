
// import bcrypt from "bcrypt"
import {User} from "../models/user.js"
import {  Chat} from "../models/chat.js";
import {Request} from "../models/request.js"
import { emitEvent, sendToken } from "../utils/feature.js";
import ErrorHandler from "../utils/utility.js";
import { TryCatch }from "../middlewares/error.js"
import { getOtherMember } from "../lib/helper.js";
import { uploadFilesToCloudinary} from "../utils/feature.js";
import {NEW_REQUEST,NEW_ATTACHMENT,NEW_MESSAGE_ALERT, REFETECH_CHATS} from "../utils/event.js"
const cookieOption = {
    maxAge:1000*60*60*24*15,sameSite:"none",
    httpOnly:true,
    secure:true
}


const login = TryCatch(async (req, res, next) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");
    
    if (!user) return next(new ErrorHandler("Invalid Username ", 404));
    
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch =( password ===user.password)
    if (!isMatch)
      return next(new ErrorHandler("Invalid Password", 404));
  
    sendToken(res, user, 200, `Welcome Back, ${user.name}`);
  });
  


const newUser = TryCatch(async (req, res, next) => {
    
    const { name, username, password, bio } = req.body;
    // console.log(name,username,bio,password)
    const file = req.file;
    
     if (!file) return next(new ErrorHandler("Please Upload Avatar"));
    
    const result = await uploadFilesToCloudinary([file]);
    
    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
    };
    
    const user = await User.create({
        name,
        bio,
        username,
        password,
        avatar,
    });
    
    sendToken(res, user, 201, "User created");
    });

const getMyProfile =TryCatch( async(req,res,next)=>{
    const id = req.user;
    // console.log(id); just to make sure
    const user = await User.findOne({
        _id:id
    })
    // console.log(user)
    res.status(200).json({user})
})

const SearchUser = TryCatch(async(req,res,next)=>{
    //name to search for
    const {name=""} =  req.query;

    const myChats  = await Chat.find({
        groupChat:false,
        members:req.user
    })
    // console.log(typeof  req.user)

    //Users that are friends and have chat with me
    const allUsersFromChat = myChats.map(({members})=>{return (
        members.filter((member)=> member.toString() !== req.user))} )

    const UsersExceptFriendsWithMe = await User.find({
        _id:{$nin : allUsersFromChat},
        name:{$regex:name,$options:"i"}
    })

    const Users = UsersExceptFriendsWithMe.map(({_id,avatar,name})=>({_id,name,avatar}))
   

    res.status(200).json({
        Users,
        success:true
    })
    
})

const SendRequest = TryCatch(async(req,res,next)=>{
    const ReceiverId = req.body.ReceiverId;
 
    const request =await Request.findOne({
       $or:[{ sender:req.user,
        receiver:ReceiverId
    },{
        sender:ReceiverId,receiver:req.user
    }
    ]})
//     console.log(request)
// console.log(req.user , " + ", ReceiverId)
    if(request) return next( new ErrorHandler("Request sent already",400))

    await Request.create({
        sender:req.user,
        receiver:ReceiverId
    })

    emitEvent(
        req,NEW_REQUEST, [ReceiverId],"request")

    return res.json({
        message:"done",
        success:true
    })
})

const acceptRequest = TryCatch(async(req,res,next)=>{

    const {RequestId ,accept} = req.body;

    // const request = await Request.deleteOne({
    //     $or:[
    //         {sender:userId,receiver:req.user},
    //         {sender:req.user , receiver:userId}
    //     ]
    // })

    const request = Request.findById(RequestId)
    .populate("sender","name")
    .populate("receiver" , "name")

    if(!request) return next(new ErrorHandler("not Found Request",404))
    
    if(request.receiver.toString() !== req.user.toString()) return next(new ErrorHandler("Receiver and me are not same",400))
    
    if(!accept){
        await request.deleteOne();
        return res.status(200).json({
            success:true,
            message:"Request Rejected"
        })
    }
   
    const members = [request.sender._id,request.receiver._id]

    await Chat.create({
        members:members,
        name:`${request.sender.name}-${request.receiver.name}`
    })
    await request.deleteOne();

    emitEvent(
        req,REFETECH_CHATS,members
    )
    return res.status(200).json({
        success:true,
        message:"accepted request",
        senderId:request.sender
    })

})

const getNotifications = TryCatch(async(req,res,next)=>{
    
    const requests = await Request.find({
        receiver:req.user

    },{_id:1,sender:1}).populate("sender","name avatar")
    
    return res.status(200).json({
        success:true,
        requests

    })

})


const getMyFriends = TryCatch(async(req,res,next)=>{
    const chatId = req.query.chatId;

  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");

  const friends = chats.map(({ members }) => {
    const otherUser = getOtherMember(members, req.user);

    return {
      _id: otherUser._id,
      name: otherUser.name,
      avatar: otherUser.avatar.url,
    };
  });

  if (chatId) {
    const chat = await Chat.findById(chatId);

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});
const Logout = TryCatch(
    async(req,res,next)=>{
        return res.status(200).cookie("token","",cookieOption).json({
            message:"LoggetOut succesfully!",
            success:true
        })
        next();
    }
)

export {login,getMyFriends ,getNotifications, acceptRequest ,SendRequest, newUser , getMyProfile, Logout , SearchUser}