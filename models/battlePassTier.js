import mongoose from "mongoose";
const { Schema, model } = mongoose;

const battlePassTierSchema = new Schema(
  {
    tier: {
      type: Number,
      //required: true,
      unique: true,
    },
    requiredXP: {
      type: Number,
      //required: true,
    },
    rewards: [
      {
        name: String,
        type: {
          type: String,
        },
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("BattlePassTier", battlePassTierSchema);
