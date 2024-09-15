import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserStatus } from "../constants";

// Define the Admin interface extending mongoose Document
interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  logo?: string;
  status: number;
  loginCount: number;
  isPasswordMatched(password: string): Promise<boolean>;
  incrementLoginCount(): Promise<IAdmin>;
  generateAuthToken(): string;
  createPasswordResetToken(): Promise<string>;
}

// Define the Admin model
const AdminSchema: Schema<IAdmin> = new Schema(
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
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [128, "Password must be less than 128 characters long"],
      validate: {
        validator: function (value: string): boolean {
          // Require at least one uppercase letter, one lowercase letter, one special character and one number
          const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/])[a-zA-Z\d!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/]{8,}$/;
          return regex.test(value);
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
      },
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
      transform(_, ret) {
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

// Hash password before saving to database
AdminSchema.pre<IAdmin>("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
    } catch (err: any) {
      return next(err);
    }
  } else {
    return next();
  }
});

// Compare password with hashed password in database
AdminSchema.methods.isPasswordMatched = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Increment login count when user logs in
AdminSchema.methods.incrementLoginCount = async function (): Promise<IAdmin> {
  this.loginCount += 1;
  return this.save();
};

// Generate a JWT token
AdminSchema.methods.generateAuthToken = function (): string {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY!, {
    // expiresIn: "1d",
  });

  return token;
};

// Static method to find by token
AdminSchema.statics.findByToken = async function (
  token: string
): Promise<IAdmin | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    return this.findById(decoded?.id).exec();
  } catch (err: any) {
    throw new Error(`Error verifying token: ${err.message}`);
  }
};

// Create password reset token
AdminSchema.methods.createPasswordResetToken =
  async function (): Promise<string> {
    const resettoken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resettoken)
      .digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    return resettoken;
  };

// Define the Admin model
const Admin: Model<IAdmin> =
  mongoose.models.admins || mongoose.model<IAdmin>("admins", AdminSchema);

export default Admin;
