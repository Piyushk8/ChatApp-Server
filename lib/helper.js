import { socketIds } from "../app.js";

export const getOtherMember = (members, userId) =>
    members.find((member) => member._id.toString() !== userId.toString());

export const getSockets =(users=[])=>{
  const sockets =  users.map((user)=>socketIds.get(user.toString()))
  return sockets;
}
export const getBase64 = (file) => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file or file buffer");
  }
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

