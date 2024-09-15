import mongoose, { Schema, Document, Model } from "mongoose";

// Define the Otp interface extending mongoose Document
interface IOtp extends Document {
  email: string;
  otp: number;
  createdAt: Date;
}

// Define the Otp schema
const OtpSchema: Schema<IOtp> = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 60, // OTP expires after 60 seconds
    default: Date.now,
  },
});

// Define the Otp model
const Otp: Model<IOtp> =
  mongoose.models.otps || mongoose.model<IOtp>("otps", OtpSchema);

export default Otp;
