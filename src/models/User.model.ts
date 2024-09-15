import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import { UserStatus } from "../constants";

// Define the User interface extending mongoose Document
interface IUser extends Document {
  name: string;
  email: string;
  mobile: number;
  referer_id?: mongoose.Types.ObjectId;
  referer_code?: string;
  refercode: string;
  balance: number;
  logo?: string;
  status: number;
  loginCount: number;
  incrementLoginCount(): Promise<IUser>;
  generateAuthToken(): string;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    mobile: {
      type: Number,
      required: true,
    },
    referer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    referer_code: {
      type: String,
      required: false,
    },
    refercode: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    logo: {
      type: String,
      required: false,
    },
    status: {
      type: Number,
      default: UserStatus.INACTIVE,
      enum: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED],
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: {
      transform(_, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

// Increment login count when user logs in
UserSchema.methods.incrementLoginCount = async function (): Promise<IUser> {
  this.loginCount += 1;
  return this.save();
};

// Generate a JWT token
UserSchema.methods.generateAuthToken = function (): string {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY!, {
    // expiresIn: "1d",
  });

  return token;
};

// Static method to find by token
UserSchema.statics.findByToken = async function (
  token: string
): Promise<IUser | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    return this.findById(decoded?.id).exec();
  } catch (err: any) {
    throw new Error(`Error verifying token: ${err.message}`);
  }
};

// Define the User model
const User: Model<IUser> =
  mongoose.models.users || mongoose.model<IUser>("users", UserSchema);

export default User;
