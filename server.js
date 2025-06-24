//importing from packages :
import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

//importing from files :
import connectToDb from "./config/db.js";
import userRouter from "./routes/User.routes.js";
import MessageRouter from "./routes/Message.routes.js";

//app
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

/*SOCKET.IO*/

//initialize
export const io = new Server(server, {
  cors: { origin: "*" }, //for allowing from all origins
});
//storin the users:
export const userSockerMap = {}; //it ll be of the form userId:socketId
//connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User with Id:${userId} connected`);

  if (userId) {
    userSockerMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSockerMap));

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
    delete userSockerMap[userId];
  });
});
//middlewares:
app.use(express.json({ limit: "5mb" }));
app.use(cors());

//routes:
app.use("/api/status", (req, res) => {
  res.send("API is working");
});
app.use("/api/user", userRouter);
app.use("/api/messages", MessageRouter);

//app.listen:
server.listen(port, async () => {
  console.log("Server is Running");
  await connectToDb();
});
