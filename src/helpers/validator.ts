import { Types } from "mongoose";

// Function to validate MongoDB ObjectId
const validateMongoDbId = (id: string): void => {
  const isValid = Types.ObjectId.isValid(id);
  if (!isValid) {
    throw new Error("This id is not valid or not found");
  }
};

export default validateMongoDbId;
