import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import slugify from "slugify";

// Define the folder where the images will be stored
const FOLDER_NAME = `/images/`;

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `${process.env.IMAGE_UPLOAD_PATH}${FOLDER_NAME}`;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${slugify(file.originalname)}`);
  },
});

// Multer file filter for image and video types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    ["image/jpeg", "image/png", "video/mp4", "video/quicktime"].includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed!"));
  }
};

// Multer configuration for multiple uploads
const multiUploads = multer({ storage, fileFilter }).fields([
  { name: "images" },
]);

// Image upload handler
export const uploadImages = asyncHandler(
  async (req: Request, res: Response) => {
    multiUploads(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      try {
        let images: string[] = [];

        // Explicitly cast req.files to the correct type
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (files && files["images"]) {
          images = files["images"].map(
            (file) =>
              `${process.env.IMAGE_PUBLIC_URL}${FOLDER_NAME}${slugify(
                file.filename
              )}`
          );
        }
        return res.status(200).json({ success: true, images });
      } catch (error: any) {
        return res
          .status(500)
          .json({
            success: false,
            message: error.message || "Server error, try again!",
          });
      }
    });
  }
);
