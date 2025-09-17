import mongoose from "mongoose";

const careerApplicationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    cvUrl: {
      type: String,
      required: true,
      trim: true,
    },
    cvPath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CareerApplication", careerApplicationSchema);
