const jwt = require("jsonwebtoken");
const Joi = require("joi");
const jwtKey = process.env.jwtKey;
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const mongoose = require("mongoose");
const User = require("../Models/User");
const multer = require("multer"); // multer will be used to handle the form data.
const path = require("path");
const sendOTPEmail = require("./Email/sendOTPEmal");
const { Chatlist, GroupChatList } = require("../Models/Chatlist");
const createError = require("../Utils/createError");
const isProduction = true; // for production make it true
const SignUp = async (req, res, next) => {
  const value = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required(),
    username: Joi.string().required(),
    location: Joi.string(),
    status: Joi.string(),
    languages: Joi.string(),
    description: Joi.string(),
    servicesExperties: Joi.string(),
    education: Joi.string(),
    certificate: Joi.string(),
  }).validate(req.body);
  if (value.error) {
    next(createError(400, value.error.details[0].message));
  }
  try {
    const {
      email,
      password,
      username,
      location,
      status,
      languages,
      description,
      servicesExperties,
      education,
      certificate,
    } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      next(createError(400, "Email already exists"));
    }
    const findUsername = await User.findOne({ username });
    if (findUsername) {
      next(createError(400, "Username already exists"));
    } else {
      // create a new chatlist for the user
      const newChatList = new Chatlist({});
      const chatList = await newChatList.save();
      const newGropuChatList = new GroupChatList({});
      const groupChatList = await newGropuChatList.save();

      if (!chatList) {
        next(createError(500, "Chatlist not created"));
      }
      if (!groupChatList) {
        next(createError(500, "Group chatlist not created"));
      }

      const hash = bcrypt.hashSync(password, salt);
      const newUser = new User({
        email: email.toLowerCase(),
        password: hash,
        username,
        location,
        status,
        languages,
        description,
        servicesExperties,
        education,
        certificate,
        chatlistId: chatList._id,
        groupChatListId: groupChatList._id,
      });
      console.log(location, status);

      const userTokenData = {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        location: newUser.location,
        status: newUser.status,
        languages: newUser.languages,
        description: newUser.description,
        servicesExperties: newUser.servicesExperties,
        education: newUser.education,
        certificate: newUser.certificate,
        chatlistId: newUser.chatlistId,
        groupChatListId: newUser.groupChatListId,
        favouriteGigs: newUser.favouriteGigs,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
      console.log(location, status);
      const token = jwt.sign(userTokenData, jwtKey, { expiresIn: "30d" });

      // newUser.token = token;
      // console.log(userTokenData)
      const createdUser = await newUser.save();
      delete createdUser.password;
      return res
        .cookie("accessToken", token, {
          httpOnly: true,
          secure: isProduction, // Set 'secure' to true only in production
          sameSite: isProduction ? "none" : "lax", // Set 'sameSite' to 'none' only in production
        })
        .status(200)
        .json({ success: true, userData: createdUser, token: token });
    }
  } catch (err) {
    return next(err);
  }
};

const SignIn = async (req, res, next) => {
  const value = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required(),
  }).validate(req.body);
  if (value.error) {
    next(createError(400, value.error.details[0].message));
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
    });
    if (user) {
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (isPasswordCorrect) {
        const userData = {
          _id: user._id,
          email: user.email,
          username: user.username,
          profileImg: user.profileImg,
          location: user.location,
          status: user.status,
          chatlistId: user.chatlistId,
          groupChatListId: user.groupChatListId,
          favouriteGigs: user.favouriteGigs,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
        const token = jwt.sign(userData, jwtKey, { expiresIn: "30d" });

        res
          .cookie("accessToken", token, {
            httpOnly: true,
            secure: isProduction, // Set 'secure' to true only in production
            sameSite: isProduction ? "none" : "lax", // Set 'sameSite' to 'none' only in production
          })
          .status(200)
          .json({
            success: true,
            message: "Login Successful",
            userData: user,
            token,
          });
      } else {
        next(createError(400, "Wrong credentials!"));
      }
    } else {
      next(createError(400, "Wrong credentials!"));
    }
  } catch (err) {
    next(err);
  }
};

const GetLoggedInUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }
    const token = authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, jwtKey);
    if (!decodedToken) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    const userId = decodedToken._id;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    return res
      .status(200)
      .json({ success: true, userData: userWithoutPassword });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (err) {
    return next(err);
  }
};

const forgetPasswordStepOne = async (req, res, next) => {
  const value = Joi.object({
    email: Joi.string().email().required(),
  }).validate(req.body);
  if (value.error) {
    // return res.status(400).json({ success: false, error: value.error.details[0].message })
    next(createError(400, value.error.details[0].message));
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      const token = jwt.sign(
        {
          id: user._id,
          otp,
        },
        jwtKey,
        { expiresIn: "30d" }
      );

      await sendOTPEmail(req.body.email, otp);
      return res
        .status(200)
        .json({ success: true, message: "OTP sent to your email", token });
    } else {
      next(createError(400, "Email not found!"));
    }
  } catch (err) {
    next(err);
  }
};

const forgetPasswordStepTwo = async (req, res, next) => {
  // save token in local storag or any other way and send it in body
  const value = Joi.object({
    token: Joi.string(),
    Otp: Joi.number().required(),
  }).validate(req.body);
  if (value.error) {
    return res.status(400).json({message:value.error.details[0].message ,success:false}) ;
  }

  try {
    const { Otp, token } = req.body;
    const decoded = jwt.verify(token, jwtKey);
    if (decoded.otp === Number(Otp)) {
      return res.status(200).json({ success: true, message: "OTP verified" });
    } else {
     return  res
     .status(400)
     .json({ message: "Wrong Otp!", success:false });
    }
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  const value = Joi.object({
    token: Joi.string(),
    password: Joi.string().min(3).required(),
    confirmpassword: Joi.string().min(3).required(),
  }).validate(req.body);
  if (value.error) {
    next(createError(400, value.error.details[0].message));
  }

  try {
    const { password, token } = req.body;
    const hash = bcrypt.hashSync(password, salt);
    // const decoded = jwt.verify(req.headers.authorization, jwtKey)
    // decode the token
    const decoded = jwt.verify(token, jwtKey);
    const user = await User.findOneAndUpdate(
      { _id: decoded.id },
      { password: hash },
      { new: true }
    );
    if (user) {
      return res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    } else {
      next(createError(400, "User not found"));
    }
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out.");
};

const GetUserByID = async (req, res, next) => {
  try {
    const { id } = req.params; // Corrected property name
    const user = await User.findById(id); // Use findById for a single document
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error retrieving horse", error: error.message });
  }
};

module.exports = {
  SignUp,
  SignIn,
  GetLoggedInUser,
  forgetPasswordStepOne,
  forgetPasswordStepTwo,
  resetPassword,
  logout,
  GetUserByID,
};
