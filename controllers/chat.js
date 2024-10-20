import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility.js";
import {Chat} from "../models/chat.js"
import {User} from "../models/user.js"
import {Message} from "../models/message.js"
import { deleteFileCloudinary, emitEvent, uploadFilesToCloudinary } from "../utils/feature.js";
import {ALERT, NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETECH_CHATS} from "../constants/event.js"


const newGroupChat = TryCatch(async(req,res,next)=>{
    const {name , members } = req.body

    if(members.length < 2){
        return next(next(new ErrorHandler("Atleast 3 members required" , 400)))}

    const allMembers = [...members , req.user];
    await Chat.create({
        name,
        groupChat:true,
        creator:req.user,
        members:allMembers,
    })
    emitEvent(req
        ,ALERT
        ,allMembers
        ,`welcome to ${name} group chat `);
    
    emitEvent(req
        ,REFETECH_CHATS
        ,allMembers)

    res.status(200).json({
        "message":"group chat created",
        success:true
    })

    })


const getMyChat= TryCatch(async(req,res,next)=>{
   

    const chats = await Chat.find({
            members:req.user
    })
    .sort({pinned:1,isOnline:1})
    .populate("members" , "_id name  avatar")

    const transformedChats = chats.map(({_id,name,members,updatedAt,groupChat,lastMessage})=>{
      const getOtherMember = (members,userId)=>{ 
        return members.find((member) => member._id.toString()!==userId.toString())
        
      }
        return{
            updatedAt,
            lastMessage,
        _id,
        groupChat,
        avatar:groupChat?members.slice(0,3).map(({avatar})=>avatar.url) : [getOtherMember(members,req.user)],
        name,
        members:members.filter((member)=>member._id.toString() !== req.user.toString() ),
       }
    })

   console.log(transformedChats)
    return res.status(200).json({
        success:true,
      transformedChats
    })

})

const getMyGroup= TryCatch(async(req,res,next)=>{
    const groups =  await Chat.find({
        members:req.user,
            groupChat:true,
        }).populate("members", "name avatar")
        
        const transformedGroups =groups.map(({_id,members,groupChat,name})=>{
        return{
            name,
            _id,
            groupChat,
            avatar:members.slice(0,3).map((member)=>member.avatar)
        }
    }) 
       return res.status(200).json({
        transformedGroups,
        success:true
       })
})
const getChatDetails= TryCatch(async(req,res,next)=>{
    const chatId = req.params.id;
    
    if(req.query.populate ==="true"){
        var chat = await Chat.findById(chatId).populate("members" , "name avatar").lean();
        if(!chat) return next(new ErrorHandler("Chat not found,404"))
   
        chat.members = chat.members.map(({_id,name,avatar})=>
                ({_id,name , avatar:avatar.url})
                ) 
    }else{
        var chat = await Chat.findById(chatId);
        
        if(!chat) return next(new ErrorHandler("Chat not found,404"))
    }

    console.log("chatDetails",chat)
    res.status(200).json({
        success:true,
        chat
    })
})

const addMembers = TryCatch(async(req,res,next)=>{
    const {chatId , members} = req.body;
    
    const chat = await Chat.findById(chatId);
    if(!chat || !members) return next(new ErrorHandler("Chat Not found or No members provided" , 400))

        if(!chat.groupChat) return next(new ErrorHandler("Not a group Chat" , 400))

            if(chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You are not Admin" , 403))

//to get User info of members using memberId
    const allMembersPromise = members.map((i)=>User.findById(i,"name"))
    const allNewMembers = await Promise.all(allMembersPromise);

    const UniqueMembers = allNewMembers.filter((i)=>!chat.members.includes(i._id.toString()))
    chat.members.push(...UniqueMembers);

    if (chat.members.length>100){
        return next(new ErrorHandler("Group Limit reached",400))
    }

    await chat.save();
    const allUsersName = allNewMembers.map((i)=>i.name).join(",")
    const allNewMembersId = allNewMembers.map((i)=>i._id)
    emitEvent(
        req,
        ALERT,
        chat.members,
        `${allUsersName} has been added in the group`
    )
    emitEvent(req,
        REFETECH_CHATS
        ,allNewMembersId);

    return res.status(200).json({
        success:true,
        message:"Members Added successFully"
    })

})

const RemoveMember=TryCatch( async(req,res,next)=>{
    const  {userId , chatId} = req.body;
    const [chat , UserToRemove] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId , "name")
    ])
    
    if(!chat || !UserToRemove) return next(new ErrorHandler("Chat Not found or No members provided" , 400))

    if(!chat.groupChat) return next(new ErrorHandler("Not a group Chat" , 400))

    if(chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You are not Admin" , 403))

    if(chat.members.length < 3)return next (new ErrorHandler("Cannot remove must have 3 members Atleast",400))

    const allChatMembers = chat.members.map((i)=>i.toString())
    chat.members = chat.members.filter((member)=>member.toString()!==userId.toString());

    await chat.save();

    emitEvent(
        req,
        ALERT,
        chat.members,
        `${UserToRemove} has been removed`
    );
    emitEvent(
        req,
        REFETECH_CHATS,
        allChatMembers,
    );

    res.status(200).json({
        success:true,
        message:"removed successfully"
    })

})


const leaveGroup = TryCatch(async(req,res,next)=>{
    const chatId = req.params.id.toString();
    const chat= await Chat.findById(chatId) 
   
    if(!chat) return next( new ErrorHandler("Chat not found" , 404))
                
    const RemainingMember = chat.members.filter((member)=>member.toString()!==req.user.toString())
    if(RemainingMember < 3) {return next(new ErrorHandler("Must have atleast 3 members"))}
    if(chat.creator.toString() === req.user){ chat.creator=RemainingMember[0]}
   
    chat.members = RemainingMember;

    const username = await User.findById(req.user)
    await chat.save();

    emitEvent(
        req,
        ALERT,
        chat.members,
        `${username} left`
    )
    emitEvent(
        req,
        REFETECH_CHATS,
        [...chat.members,req.user],
    )

    res.json({
        success:true,
        message:"Group Left"        
    })
})

const SendAttachment = TryCatch(async(req,res,next)=>{
    const{ chatId }= req.body
    const chat = await Chat.findById(chatId);
    const me = await User.findById(req.user)
    console.log(me)
    if (!chat) return next(new ErrorHandler("chat not found" ,404))
    
    const files = req.files || [];
    console.log(files)
    if(files.length<1) return next(new ErrorHandler("Attach atleast one" , 400))

    const attachments = await uploadFilesToCloudinary(files)
   

    const messageForDb = {
        content:"" ,
        attachments,
        sender:me._id ,
        chatId,
        chat:chatId}
    const messageForRealtime = {
       ...messageForDb,
       sender:{
        _id:me._id,
        name:me.name,
        avatar:me.avatar.url
       }
    };
    const message = await Message.create(messageForDb)
         
    emitEvent(req,NEW_MESSAGE,
    chat.members, {message:messageForRealtime , chatId}) 
    
    emitEvent(req,NEW_MESSAGE_ALERT,chat.members , {chatId})
    
res.status(200).json({
    message:"Done"
})
})



const RenameGroup = TryCatch(async(req,res,next)=>{
    const chatId = req.params?.id;
    const name = req.body?.name;
    const chat = await Chat.findById(chatId)

    chat.name =  name;
    chat.save();
   if(chat.modifiedCount <1) return next(new ErrorHandler("no Group found",404))
    
    res.status(200).json({
        success:true,
        message:"done name updated"
    })

    emitEvent(req,REFETECH_CHATS,chat.members)
})

const deleteChat =TryCatch(async(req,res,next)=>{
    const chatId =req.params.id;
    const chat = await Chat.findById(chatId);

    if (req.user.toString()!==chat.creator?.toString() && chat.groupChat===true) return next(new ErrorHandler("You are not an Admin",400))
    if (!chat.members.includes(req.user.toString())) return next(new ErrorHandler("You are not member of the group",400))
    

//!to delete the Attachmenst from the cloudinary storage 

    const public_ids = [];

    const messageWithAttachments = await Message.find({
        chat:chatId,
        attachments:{$exists:true , $ne:[]},
    });

    messageWithAttachments.forEach(({ attachments })=>{
         attachments.forEach((attachment)=>{
            public_ids.push(attachment.public_id);
        })
    })
    await Promise.all([
    deleteFileCloudinary(public_ids),
    Chat.deleteOne({_id:chatId}),
    Message.deleteMany({ chat:chatId })])
        const members= chat.members;
   emitEvent(
    req,
    REFETECH_CHATS,
    members
   )
  

   res.status(200).json({success:true,
    message:chat?.groupChat ? "Group Deleted":"Removed friend" 
   })
});

const getMessages = TryCatch(async(req,res,next)=>{

    const chatId = req.params.id;
    const {page = 1 } = req.query;
    const messagePerPage =20;
    const skip = (page -1)*messagePerPage;
    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found",404))
    if(!chat.members.includes(req.user.toString())) return next(new ErrorHandler("You are not member",400))

    const [messages,totalMessageCount] = await Promise.all([
        Message.find({
            chat:chatId
        }).sort({createdAt:-1})
        .skip(skip)
        .limit(messagePerPage)
        .populate("sender","name avatar")
        .lean(),

        Message.countDocuments({chat:chatId})
    
    ])


    res.status(200).json({
        success:true,
        message:messages.reverse() ,
        totalMessageCount,
    totalPages:Math.ceil(totalMessageCount/messagePerPage)   })

})







export {getChatDetails,newGroupChat,getMyGroup ,addMembers, getMyChat ,RemoveMember,leaveGroup ,SendAttachment
    ,RenameGroup, deleteChat,getMessages
}