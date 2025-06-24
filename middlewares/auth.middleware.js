import jwt from "jsonwebtoken";
import User from "../models/User.models.js";

export async function userAuth(req, res, next) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(404).json({ success: false, message: "Unauthorized" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(404).json({ success: false, message: "Unauthorized" });
    }
    const user = await User.findById(decode.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
}
