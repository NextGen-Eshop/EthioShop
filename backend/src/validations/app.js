import mongoose from "mongoose";

export const isValidObjectId = (value) =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

export const missingRequiredFields = (payload = {}, requiredFields = []) =>
  requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });

export const ensurePositiveInteger = (value, fallback = 1) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};
