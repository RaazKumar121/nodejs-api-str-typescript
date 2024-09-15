import jwt from "jsonwebtoken";

// Define type for the payload
interface TokenPayload {
  id: string;
}

// Function to generate a refresh token
const generateRefreshToken = (id: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Function to generate a token
const generateToken = (id: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET);
};

export { generateRefreshToken, generateToken };
