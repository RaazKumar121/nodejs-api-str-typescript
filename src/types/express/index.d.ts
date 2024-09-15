import { UserDocument } from "../../models/User.model"; // Assuming this is the type for your User schema
import { AdminDocument } from "../../models/Admin.model"; // Assuming this is the type for your Admin schema

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument | AdminDocument; // Add both user and admin types
    }
  }
}
