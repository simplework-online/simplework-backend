const CreateService = require("../../Models/CreateService");
const User = require("../../Models/User");


const getAllServices = async (req, res) => {
    try {
        const services = await CreateService.find();
        res.status(200).json({ success: true, services })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })

    }
}

const getSearchServices = async (req, res) => {
    try {
        // const services = await CreateService.find({category: req.body.category, subcategory: req.body.subcategory});
        const services = await CreateService.find({ category: req.params.category });

        res.status(200).json({ success: true, services })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })

    }
}

const searchUserServices = async (req, res) => {
    try {
        //  find all users which contains the given string in their name
        const searchQuery = req.query.name;
        const users = await User.find({ name: { $regex: searchQuery, $options: 'i' } });
        if (users.length === 0) {
            return res.status(200).json({ success: true, message: "No user found" })
        }
        res.status(200).json({ success: true, users })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })

    }
}






module.exports = { getAllServices, getSearchServices, searchUserServices }
