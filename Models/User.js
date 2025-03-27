const { required } = require("joi");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    token: {
      type: String,
    },
    aboutme: {
      type: String,
    },
    company: {
      type: String,
    },
    position: {
      type: String,
    },
    location: {
      type: String,
      default: "Pakistan",
    },
    status: {
      type: String,
      default: "(Level 2)",
    },
    languages: {
      type: String,
      default: "English",
    },
    description: {
      type: String,
    },
    servicesExperties: {
      type: String,
    },
    education: {
      type: String,
    },
    certificate: {
      type: String,
    },
    chatlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatlist",
      required: true,
    },
    groupChatListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupChatList",
    },
    favouriteGigs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreateService",
        default: [],
      },
    ],
    createdGigs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreateService",
        default: [],
      },
    ],
    currency: {
      type: String,
      default: "pkr",
    },
    payment: {
      type: String,
      default: "paypal",
    },
    onlineStatus: {
      type: Boolean,
      default: false,
    },
    deleteStatus: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    // Reviews of the user as an array of subdocuments
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProfileReview",
        default: [],
      },
    ],
    // Projects of the user as an array of subdocuments
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProfileProjects",
        default: [],
      },
    ],
    // Achievements of the user as an array of subdocuments
    achievements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
