const Joi = require('joi');
const mongoose = require('mongoose');
const Order = require('../../Models/Order');
const Review = require('../../Models/Review');


// create a new review or update the existing review
const PostReview = async (req, res) => {

    // req.body.createdForType is used to check if the review is for buyer or talent
    // req.body.orderId is used to get the serviceId, createdBy, createdFor
            console.log("kadsjkasdlkjalkjlajlslksajlk");
    const value = Joi.object({
        review: Joi.string().required(),
        rating: Joi.number().required(),
        // ServiceDelivery: Joi.number().min(1).max(5).required(),
        // Communication: Joi.number().min(1).max(5).required(),
        // Recommend: Joi.number().min(1).max(5).required(),
        // cretedForType should be buyer or talent validation
        createdForType: Joi.string().valid('buyer', 'talent').required(), // review is for talent or buyer
        // orderId: Joi.string().required(),
    }).validate(req.body);
    if (value.error) {
        return res.status(400).json(value.error.details[0].message);
    }
    // orderId will give you serviceId, createdBy, createdFor,
    try {
        const { review, rating,
            //  ServiceDelivery, Communication, Recommend, orderId
             } = req.body;
        // const orderData = await Order.findOne({ _id: orderId });
        // check if order object has reviewId property or not
        // console.log("orderData====>>>", orderData);
        // if (orderData) {
            // if (orderData.reviewId) {
                // if reviewId is present then update the review

                // const reviewUpdate = await Review.findByIdAndUpdate(orderData.reviewId, {
                //     review,
                //     rating,
                //     ServiceDelivery,
                //     Communication,
                //     Recommend,
                // }, { new: true });
                // if (reviewUpdate) {
                //     return res.status(200).json({ message: "Review updated successfully", data: reviewUpdate });

                // }
                // else {
                //     return res.status(500).json({ message: "Review not updated" });

                // }
            // }

            // if (!orderData) {
            //     return res.status(400).json({ message: "Order not found" });
            // }

            // else {
            //     console.log(req.payload._id);
                // if reviewId is not present then create a new review
                const reviewData = new Review({
                    review,
                    rating,
                    // ServiceDelivery,
                    // Communication,
                    // Recommend,
                    // serviceId: orderData.buyerId,
                    // orderId: orderData._id,
                    // createdBy: req.payload._id,
                    // createdFor: req.body.createdForType === 'buyer' ?
                    //     orderData.buyerId : req.body.createdForType === 'talent' ?
                    //         orderData.talentId : null,
                    createdForType: req.body.createdForType,
                });
                const reviewSave = await reviewData.save();
                if (reviewSave) {
                 
                        return res.status(200).json({ message: "Review saved successfully", data: reviewSave });

                   

                }
                else {
                    return res.status(500).json({ message: "Review not saved" });

                }
            // }


        // }
        // else {
        //     return res.status(400).json({ message: "Order not found" });
        // }

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err });
    }

}

const getReview = async (req, res) => {
    try {
        const reviewData = await Review.findOne({ orderId: req.params.orderId });
        if (reviewData) {
            return res.status(200).json({ message: "Review data", data: reviewData });
        }
        else {
            return res.status(400).json({ message: "Review not found" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err });




    }
}
const getReviewAll = async (req, res) => {
    try {
        const reviewData = await Review.find();
        if (reviewData) {
            return res.status(200).json({ message: "Review data", data: reviewData });
        }
        else {
            return res.status(400).json({ message: "Review not found" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err });




    }
}



const deleteReview = async (req, res) => {

    try {
           const reviewID = req.params.reviewID
        const deleteReview = await Review.findOneAndDelete(reviewID)
        if (deleteReview) {
            

            return res.status(200).json({ message: "Review deleted successfully" });
        }
        else {
            return res.status(400).json({ message: "Review not found" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err });
    }
}




module.exports = { PostReview, getReview, deleteReview, getReviewAll };