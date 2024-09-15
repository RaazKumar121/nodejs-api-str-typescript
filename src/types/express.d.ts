// types/express.d.ts

import { UserDocument } from "../models/User.model"; // Assuming you have a User model type

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument; // or AdminDocument if it's for admin routes
    }
  }
}
