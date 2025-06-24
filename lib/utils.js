import jwt from "jsonwebtoken";

export function generateToken(par) {
  const token = jwt.sign({ id: par }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
}
