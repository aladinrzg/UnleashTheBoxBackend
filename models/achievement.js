import mongoose from "mongoose";
const { Schema, model } = mongoose;

const achievementSchema = new Schema(
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
   
  },
  {
    timestamps: true,
  }
);

export default model("Achievement", achievementSchema);
