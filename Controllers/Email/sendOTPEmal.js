const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const {
// GOOGLE_CLIENT_ID,
// GOOGLE_CLIENT_SECRET,
// GOOGLE_REDIRECT_URI,
// REFRESH_TOKEN,
OWNER_EMAIL,
APP_PASSWORD
} = require("../../Config/config");
// const oAuth2Client = new google.auth.OAuth2(
// GOOGLE_CLIENT_ID,
// GOOGLE_CLIENT_SECRET,
// GOOGLE_REDIRECT_URI
// );

// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const sendOTPEmail = async (email, otp) => {
return new Promise(async (resolve, reject) => {
try {
// const accessToken = await oAuth2Client.getAccessToken();
// if (!accessToken.token)
// throw new Error("Failed to generate access token");

// const transport = nodemailer.createTransport({
// service: "gmail",
// auth: {
// type: "OAuth2",
// user: OWNER_EMAIL,
// clientId: GOOGLE_CLIENT_ID,
// clientSecret: GOOGLE_CLIENT_SECRET,
// refreshToken: REFRESH_TOKEN,
// accessToken: accessToken,
// },
// });
const transport = nodemailer.createTransport({
service: "Gmail",
host: "smtp.gmail.com",
port: 465,
secure: true,
auth: {
user:OWNER_EMAIL ,
pass:APP_PASSWORD ,
},
});
const mailOptions = {
from: `SimpleWork <${OWNER_EMAIL}>`,
  to: email,
  subject: "OTP for Linkeble",
  text: `Your OTP is ${otp}`,
  html: `
    <h1 >Forgot Password Request</h1>
    <h3>Your OTP is <b>${otp}</b></h3>
    `,
      };

      const result = await transport.sendMail(mailOptions);
      resolve({ success: true, message: "OTP sent successfully" });
      } catch (error) {
      console.log(error);
      reject({ success: false, message: "Something went wrong", error: error });
      }
      });
      };

      module.exports = sendOTPEmail;