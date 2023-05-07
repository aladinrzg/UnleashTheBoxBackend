import mongoose from "mongoose";
const { Schema, model } = mongoose;

const gameSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
      
    },
    started: {
      type: Boolean,
      default: false,
    },
    ended: {
      type: Boolean,
      default: false,
    },
    hoster:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ]
  },
  {
    timestamps: true,
  }
);

export default model("Game", gameSchema);
