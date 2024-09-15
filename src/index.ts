import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/Auth.routes";
import connect from "./config/db";
// Load environment variables
dotenv.config();

// Create an Express application
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Working" });
});

// API v1 routes
app.get("/v1", (req: Request, res: Response) => {
  res.json({ message: "Welcome" });
});

// app.use("/v1", appRouter);
app.use("/v1/auth", authRoutes);

// Database connection and server start
connect()
  .then(() => {
    try {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server connected to http://localhost:${PORT}`);
      });
    } catch (error) {
      console.log("Cannot connect to the server: ", error);
    }
  })
  .catch((error: any) => {
    console.log("Invalid database connection: ", error);
  });
