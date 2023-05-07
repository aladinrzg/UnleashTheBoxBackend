import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      //required: true,
    },
    password: {
      type: String,
      required: true,
    },
    coins: {
      type: Number,
      // required: true,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    battlepassLevel: {
      type: Number,
      // battepass progression,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      // required: true,
    },

    diamonds: {
      type: Number,
      default: 0,
    },
    hasBattlePass: {
      type: Boolean,
      default: false,
    },
    battlePassExpireDate: {
      type: Date,
    },
    battlePassTier: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default model("User", userSchema);
