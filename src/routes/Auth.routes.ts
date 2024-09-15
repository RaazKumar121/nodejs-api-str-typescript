import express, { RequestHandler } from "express";
import { ApiRateLimiter } from "../middlewares/Auth";
import {
  sendOtp,
  verifyOtp,
  registerAdmin,
  loginAdmin,
  sendLoginOtp,
} from "../controllers/Auth.controller";
import sendMail from "../mail";

// Create an instance of express.Router
const authRoutes = express.Router();

// Define route handlers with appropriate types
authRoutes.post("/send-otp", ApiRateLimiter, sendOtp as RequestHandler);
authRoutes.post(
  "/send-login-otp",
  ApiRateLimiter,
  sendLoginOtp as RequestHandler
);
authRoutes.post("/verify-otp", ApiRateLimiter, verifyOtp as RequestHandler);
authRoutes.get("/mail/send", sendMail);
authRoutes.post(
  "/admin/register",
  ApiRateLimiter,
  registerAdmin as RequestHandler
);
authRoutes.post("/admin/login", ApiRateLimiter, loginAdmin as RequestHandler);

export default authRoutes;
