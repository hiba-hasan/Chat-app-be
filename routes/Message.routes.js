import { Router } from "express";
import {
  getMessages,
  sendMessage,
  sideBarUsers,
} from "../controllers/Message.controllers.js";
import { userAuth } from "../middlewares/auth.middleware.js";
const MessageRouter = Router();

MessageRouter.get("/users", userAuth, sideBarUsers);
MessageRouter.get("/:id", userAuth, getMessages);
MessageRouter.post("/send/:id", userAuth, sendMessage);

export default MessageRouter;
