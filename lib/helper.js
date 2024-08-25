import { socketIds } from "../app.js";
import { Chat } from "../models/chat.js";

export const getOtherMember = (members, userId) =>
    members.find((member) => member._id.toString() !== userId.toString());

export const getSockets =(users)=>{
  // console.log(users,"get")
  const sockets =  users?.map((user)=>socketIds.get(user?.toString()))
  return sockets;
}
export const getBase64 = (file) => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file or file buffer");
  }
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};
export async function getOnlineUsers(userId){
  //this returns all the ChatIds where member is online
  const onlineMemberIds = await Chat.aggregate([
    {
      $match: {
        members:userId, 
        groupChat: false 
      }
    },
    {
      $lookup: {
        from: 'users', 
        localField: 'members',
        foreignField: '_id',
        as: 'members'
      }
    },
    {
      $unwind: '$members' 
    },
    {
      $match: {
        'members._id': { $ne:userId }, // Exclude the current user
        'members.isOnline': true // Only include online members
      }
    },
    {
      $group: {
        _id: null, 
        onlineMembers: { $addToSet: '$members._id' } // Collect unique online member IDs
      }
    },
    {
      $project: {
        _id: 0, 
        onlineMembers: 1 
      }
    }
  ]);
  
 
   return {onlineMemberIds}
  }
  
