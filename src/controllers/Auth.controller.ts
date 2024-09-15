import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Otp from "../models/Otp.model";
import User from "../models/User.model";
import { UserStatus } from "../constants";
import sendMail from "../mail/index";
import Admin from "../models/Admin.model";
import { generateRefreshToken, generateToken } from "../helpers/generateTokens";

// Define interface for request body
interface SendOtpRequest extends Request {
  body: {
    email: string;
    referer_code?: string;
    name?: string;
    mobile?: number;
    refercode?: string;
  };
}

interface VerifyOtpRequest extends Request {
  body: {
    otp: string;
  };
}

interface SendLoginOtpRequest extends Request {
  body: {
    email: string;
  };
}

interface RegisterAdminRequest extends Request {
  body: {
    email: string;
    [key: string]: any; // Add more fields as required
  };
}

interface LoginAdminRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// Handler to send OTP

const sendOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, referer_code } = req.body;
    try {
      if (email) {
        let referer_id: string | undefined;
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.status === UserStatus.ACTIVE) {
          res.json({ success: false, message: "Email already exists" });
          return;
        }
        const existingOTP = await Otp.findOne({ email });
        if (existingOTP) {
          res.status(200).json({
            success: false,
            message: "Email address already requested OTP",
          });
          return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const newOTP = new Otp({ email, otp });
        await newOTP.save();
        await sendMail({ email, otp, isOtp: true });

        if (!existingUser) {
          if (referer_code) {
            const referer = await User.findOne({ refercode: referer_code });
            referer_id = referer?.id;
          }
          const user = new User({
            ...req.body,
            referer_id,
            refercode: "A1A1A1",
          });
          await user.save();
        }
        res.json({ success: true, message: "OTP sent successfully" });
      } else {
        res
          .status(200)
          .json({ success: false, message: "Please fill your email" });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to send OTP",
      });
    }
  }
);

// Handler to verify OTP
const verifyOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { otp } = req.body;
      if (otp) {
        const existingOTP = await Otp.findOne({ otp });
        if (existingOTP) {
          const already = await User.findOne({ email: existingOTP.email });
          if (already) {
            await Otp.findByIdAndDelete(existingOTP._id);
            await User.findByIdAndUpdate(already.id, {
              status: UserStatus.ACTIVE,
            });
            const token = generateToken(already.id);
            res.json({
              success: true,
              message: "Login success",
              token,
            });
            return;
          } else {
            res
              .status(200)
              .json({ success: false, message: "Email does not exist" });
            return;
          }
        }
        res.status(200).json({ success: false, message: "Invalid OTP" });
        return;
      } else {
        res.status(200).json({ success: false, message: "Please fill OTP" });
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error, try again!",
      });
    }
  }
);

// Handler to send login OTP
const sendLoginOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    try {
      if (email) {
        const existingUser = await User.findOne({
          email,
          status: UserStatus.ACTIVE,
        });
        if (!existingUser) {
          res.json({ success: false, message: "Email not found" });
          return;
        }
        const existingOTP = await Otp.findOne({ email });
        if (existingOTP) {
          res.status(200).json({
            success: false,
            message: "Email address already requested OTP",
          });
          return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const newOTP = new Otp({ email, otp });
        await newOTP.save();
        await sendMail({ email, otp, isOtp: true });
        res.json({
          success: true,
          message: "OTP sent successfully",
          otp,
        });
        return;
      } else {
        res
          .status(200)
          .json({ success: false, message: "Please fill your email" });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to send OTP",
      });
    }
  }
);

// Handler to register admin
const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const findAdmin: any = await Admin.findOne({ email });
  const refreshToken = await generateRefreshToken(findAdmin._id);
  if (!findAdmin) {
    const newAdmin = await Admin.create(req.body);
    res.cookie("token", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      message: "Register Success",
      status: 1,
      data: newAdmin,
      token: refreshToken,
    });
  } else {
    throw new Error("Admin Already Exists");
  }
});

// Handler to login admin
const loginAdmin = asyncHandler(
  async (req: LoginAdminRequest, res: Response) => {
    const { email, password } = req.body;
    const findAdmin: any = await Admin.findOne({ email });
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findAdmin._id);
      const updateAdmin = await Admin.findByIdAndUpdate(
        findAdmin.id,
        { refreshToken },
        { new: true }
      ).select("-password");
      res.cookie("token", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        message: "Login Success",
        status: 1,
        data: updateAdmin,
        token: generateToken(findAdmin._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  }
);

export { sendOtp, verifyOtp, registerAdmin, loginAdmin, sendLoginOtp };
