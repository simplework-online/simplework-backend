const express = require("express");
const {
  SignUp,
  getSignup,
  SignIn,
  GetLoggedInUser,
  forgetPasswordStepOne,
  forgetPasswordStepTwo,
  resetPassword,
  logout,
  GetUserByID,
} = require("../Controllers/Login");
const { auth } = require("../Middlewares/auth");
const router = express.Router();
router.post("/signup", SignUp);
router.post("/signIn", SignIn);
router.get("/signIn", GetLoggedInUser);
router.get("/signInbyid/:id", GetUserByID);

router.post("/forget-password/send-email", forgetPasswordStepOne);
router.post("/forget-password/verify-code", forgetPasswordStepTwo);
router.post("/forget-password/reset-password", resetPassword);
router.get("/logout", logout);
module.exports = router;
