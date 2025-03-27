const Joi = require("joi");
const mongoose = require("mongoose");
const Order = require("../../Models/Order");
const Review = require("../../Models/Review");
const User = require("../../Models/User");
const Gigs = require("../../Models/CreateService");
const Achievement = require("../../Models/Acheivement");
const ProfileProjects = require("../../Models/ProfileProjects");
const ProfileReview = require("../../Models/ProfileReviews");
const { language } = require("googleapis/build/src/apis/language");

const getProfile = async (req, res) => {
  const { userid } = req.query;
  console.log(req.body);
 
  try {
    const user = await User.findOne({ _id: userid });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
   
    // Get user's created gigs
    const createdGigs = await Gigs.find({ user_id: userid });
   
    // Get user's achievements
    const achievements = await Achievement.find({ user_id: userid });
   
    // Get user's profile projects
    const profileProjects = await ProfileProjects.find({ user_id: userid });
   
    // Get profile reviews
    const profileReviews = await ProfileReview.find({ user_id: userid })
      .populate('given_by', 'username profileImage'); // Populate given_by field
    console.log("Profile reviews:", profileReviews);
   if(user.deleteStatus){
      return res.status(400).json({ message: "User not found" });
   }
    const userGigs = createdGigs.map((gig) => {
      return {
        id: gig._id,
        title: gig.title,
        description: gig.description,
        category: gig.category,
        subcategory: gig.subcategory,
        rating: gig.rating,
        price: gig.pricing?.basic?.price || 0,
        image:
          gig.servicesImages && gig.servicesImages.length > 0
            ? gig.servicesImages[0].image
            : "",
        sales: gig.sales,
        serviceStatus: gig.serviceStatus
      };
    });
   
    const userData = {
      userId: user._id,
      servicesExperties: user.servicesExperties,
      username: user.username,
      contactInfo: user.email,
      languages: user.languages,
      profileImage: user.profileImage,
      aboutme: user.aboutme,
      company: user.company,
      position: user.position,
      location: user.location,
      status: user.status,
      description: user.description,
      education: user.education,
      certificate: user.certificate,
      createdGigs: userGigs,
      reviews: user.reviews,
      onlineStatus: user.onlineStatus,
     
      // New data being added
      achievements: achievements.map(achievement => ({
        id: achievement._id,
        title: achievement.title,
        subtitle: achievement.subtitle,
        date: achievement.date
      })),
     
      profileProjects: profileProjects.map(project => ({
        id: project._id,
        title: project.title,
        image: project.image
      })),
     
      profileReviews: profileReviews.map(review => ({
        id: review._id,
        comment: review.comment,
        rating: review.rating,
        createdAt: review.createdAt,
        given_by: {
          id: review.given_by?._id,
          username: review.given_by?.username,
          profileImage: review.given_by?.profileImage
        }
      }))
    };
    return res.status(200).json({ message: "User data", data: userData });
   
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getProfile };
