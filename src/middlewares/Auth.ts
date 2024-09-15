import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import RateLimit from "express-rate-limit";
import User from "../models/User.model";
import Admin from "../models/Admin.model";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Middleware to authenticate users
export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;
    try {
      if (
        req?.headers?.authorization?.startsWith("Bearer") ||
        req.cookies.token
      ) {
        token = req.headers?.authorization?.split(" ")[1] || req.cookies.token;
        if (token) {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
          ) as DecodedToken;
          const user = await User.findById(decoded.id);
          if (user && user.status === 1) {
            req.user = user; // TypeScript now knows req.user exists
            next();
          } else {
            res.status(403).json({
              success: false,
              message: "Account not activated or blocked",
            });
          }
        } else {
          res.status(401).json({
            success: false,
            message: "Token expired, please login again",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          message: "Authorization token not available",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Authorization failed",
      });
    }
  }
);


// Middleware to verify admin access
export const isAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;
    try {
      if (
        req?.headers?.authorization?.startsWith("Bearer") ||
        req.cookies.token
      ) {
        token = req.headers?.authorization?.split(" ")[1] || req.cookies.token;
        if (token) {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
          ) as DecodedToken;
          const admin = await Admin.findById(decoded.id);
          if (admin && admin.status === 1) {
            req.user = admin; // No error anymore
            next();
          } else {
            res.status(403).json({
              success: false,
              message: "Admin account not activated or blocked",
            });
          }
        } else {
          res.status(401).json({
            success: false,
            message: "Token expired, please login again",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          message: "Authorization token not available",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Authorization failed",
      });
    }
  }
);

// Rate Limiter
export const ApiRateLimiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Use `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
