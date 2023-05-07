import mongoose from "mongoose";
const { Schema, model } = mongoose;

const itemSchema = new Schema(
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
    skinType :{
      type: String,
      required: true,
    },
    file :{
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export default model("Item", itemSchema);
