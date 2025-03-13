const Joi = require("joi")
const User=require('../Models/User')

const getFavouriteGigs=async(req,res,next)=>{
try {
    const favouriteGigs=await User.findById(req.payload._id,'favouriteGigs').populate('favouriteGigs',"title rating pricing servicesImages")
    if(!favouriteGigs){
        return res.status(500).json({ success: false, error: "something went wrong" })
    }
    res.status(200).json({success:true,favouriteGigs})
} catch (error) {
    next(error)
}

}

const favouriteGig = async (req, res, next) => {
    console.log(req.payload)
    console.log("req body", req.body)
    const value = Joi.object({
        gigId: Joi.string().required()
    }).validate(req.body)
    if (value.error) {

        return res.status(400).json({ success: false, error: value.error.details[0].message })
    }
    try {
        const { gigId } = req.body;
        //  append this in user database to store the favourite gigs
        const updateUserData = await User.findByIdAndUpdate(
            req.payload._id,
            { $push: { favouriteGigs: gigId } }, // Update object
            { new: true } // Options: return the updated document
        );
        console.log("updateUserDataupdateUserData",updateUserData)
        if (!updateUserData) {
            return  res.status(500).json({ success: false, error: "something went wrong" })
        }
        res.status(200).json({ success: true, message: "Gig added to favourite" })
    }
    catch (err) {
        console.log("server Error",err)
        next(err)
    }
}

const deleteFavouriteGig = async (req, res) => {
    const value = Joi.object({
        gigId: Joi.string().required()
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ success: false, error: value.error.details[0].message })
    }
    try {
        const { gigId } = req.body;
        const updateUserData = await User.findByIdAndUpdate(req.payload._id, {
            $pull: {
                favouriteGigs: gigId
            }
        })
        if (!updateUserData) {
           return res.status(500).json({ success: false, error: "something went wrong" })
        }
        res.status(200).json({ success: true, message: "Gig removed from favourite" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ success: false, error: "Internal server error" })
    }
}

module.exports = {
    favouriteGig,
    deleteFavouriteGig,
    getFavouriteGigs
}
