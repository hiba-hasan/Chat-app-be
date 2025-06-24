import cloudinary from "../config/cloudinary.js";
import Message from "../models/Message.models.js";
import User from "../models/User.models.js";
import { io, userSockerMap } from "../server.js";

//GETTING SIDEBAR DATA ;LIKE THE SIDEBAR USERS AND THE NO.OF UNSEEN MESSSAGES FOR EACH USER
export async function sideBarUsers(req, res, next) {
  try {
    const userId = req.user._id;
    const sideBarUserss = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    console.log("SidebarUsers", sideBarUserss);

    const unseenMessages = {}; //its goin to be of the form : senderId:9
    await Promise.all(
      sideBarUserss.map(async (user) => {
        //getting the no.of unseen msgs for each user
        const messages = await Message.find({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });
        if (messages.length > 0) {
          //if there are any unseen messages:
          unseenMessages[user._id] = messages.length;
        }
      })
    );

    res.json({ success: true, users: sideBarUserss, unseenMessages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

//GETTING THE MESSAGE FOR A PARTICULAR USER
export async function getMessages(req, res, next) {
  try {
    const { id: otherUserId } = req.params;
    const myUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: otherUserId, receiverId: myUserId },
        { senderId: myUserId, receiverId: otherUserId },
      ],
    });

    await Message.updateMany(
      { senderId: otherUserId, receiverId: myUserId },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

//SEND MESSAGE TO A PARTICULAR USER
export async function sendMessage(req, res, next) {
  try {
    const { id: otherUserId } = req.params;
    const myUserId = req.user._id;
    const { text, image } = req.body;

    let imageUrl;
    if (image) {
      imageUrl = (await cloudinary.uploader.upload(image)).secure_url;
    }

    const newMessage = await Message.create({
      senderId: myUserId,
      receiverId: otherUserId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSockerMap[otherUserId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
