import { Router } from "express";
import {
  checkUserAuth,
  signIn,
  signUp,
  updateUserProfile,
} from "../controllers/User.controllers.js";
import { userAuth } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.post("/sign-up", signUp);
userRouter.post("/sign-in", signIn);
userRouter.get("/check-auth", userAuth, checkUserAuth);
userRouter.put("/update", userAuth, updateUserProfile);

export default userRouter;
