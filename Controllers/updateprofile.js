const User = require("../Models/User");

exports.EditProfile = async (req, res, next) => {
  try {
    const {
      email,
      username,
      location,
      status,
      languages,
      description,
      servicesExperties,
      education,
      certificate,
      currency,
    } = req.body;
    console.log(req.body);
    // Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Update the user's profile information
    user.username = username;
    user.location = location;
    user.status = status;
    user.languages = languages;
    user.description = description;
    user.servicesExperties = servicesExperties;
    user.education = education;
    user.certificate = certificate;
    user.currency = currency;

    // Save the updated user profile
    const updatedUser = await user.save();

    // Create a new token with the updated user data
    const userTokenData = {
      _id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username,
      location: updatedUser.location,
      status: updatedUser.status,
      languages: updatedUser.languages,
      description: updatedUser.description,
      servicesExperties: updatedUser.servicesExperties,
      education: updatedUser.education,
      certificate: updatedUser.certificate,
      chatlistId: updatedUser.chatlistId,
      groupChatListId: updatedUser.groupChatListId,
      currency: updatedUser.currency,
      favouriteGigs: updatedUser.favouriteGigs,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    res.status(200).json({ success: true, userData: updatedUser });
  } catch (err) {
    return next(err);
  }
};

exports.signupGet = async (req, res, next) => {
  try {
    // Extract the user's email from the request query parameters or headers
    const email = req.query.email || req.headers.email;

    // Find the user by their email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Remove the password from the user object
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    return res
      .status(200)
      .json({ success: true, userData: userWithoutPassword });
  } catch (err) {
    return next(err);
  }
};
