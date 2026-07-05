import jwt from "jsonwebtoken";

// Why this file exists: token generation is a single, isolated concern.
// Both register and login need to produce a JWT the same way — keeping it
// here means there's exactly one place that knows the token's shape
// (payload: { id }) and its signing config, instead of duplicating
// jwt.sign(...) calls across controllers.
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
