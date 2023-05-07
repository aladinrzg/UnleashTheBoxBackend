import mongoose from "mongoose";
const { Schema, model } = mongoose;

const lobbySchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    port: {
      type: Number,
      required: true,
    },
    nbPlayers: {
      type: Number,
      required: true,
      default: 1,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    routerIpAddress: {
      type: String,
      required: true,
    },
    machineIpAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Lobby", lobbySchema);
