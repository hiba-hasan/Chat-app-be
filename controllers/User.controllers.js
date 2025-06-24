import cloudinary from "../config/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.models.js";
import bcrypt from "bcryptjs";

//USER SIGN-UP:
export async function signUp(req, res, next) {
  try {
    const { name, email, password, bio } = req.body;
    if (!name || !email || !password || !bio) {
      const error = new Error("Please Fill in all the details");
      error.statusCode = 404;
      throw error;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user:
    const newUser = await User.create({
      email,
      name,
      bio,
      password: hashedPassword,
    });

    //generate the token:
    const token = generateToken(newUser._id);

    res
      .status(201)
      .json({ success: true, message: "User Created Successfully", token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

//USER SIGN-IN:
export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Pls fill all the details");
      error.statusCode = 404;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const error = new Error("User doesnt exist");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid Password" });
    }

    const token = generateToken(existingUser._id);

    res
      .status(200)
      .json({ success: true, message: "Logged In Successfully", token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

//CHECK USER-AUTH:

export function checkUserAuth(req, res, next) {
  return res.json({ success: true, user: req.user });
}

//UPDATE USER PROFILE DETAILS:

//I CANT UNDERSTAND why he is doing this ,like if there is no profile pic then user wants to update name and bio,
//if there is profile pic then user wants to update name , bio and profile pic...what if the user wants to update any one ??

export async function updateUserProfile(req, res, next) {
  try {
    const { profilePic, name, bio } = req.body;
    const user = req.user;

    let updatedUser;
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        { name, bio },
        { new: true }
      );
    } else {
      let profileUrl = await cloudinary.uploader.upload(profilePic).secure_url;
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          name,
          bio,
          profilePic: profileUrl,
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
