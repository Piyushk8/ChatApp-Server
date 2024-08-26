import mongoose, { Schema, model } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    groupChat: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,  // Set default value to current time
    },
  },
  {
    timestamps: true,
  }
);

schema.pre('save', function (next) {
  if (this.isModified("lastMessage")) {
    this.updatedAt = Date.now();
  }
  next();
});

export const Chat =  model("Chat", schema);