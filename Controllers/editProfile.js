const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const cloudinary = require("cloudinary").v2;

const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { email, username, currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }
        if (email) {
            user.email = email;
        }
        if (username) {
            user.username = username;
        }
        if (req.files) {
            const filePath = req.files.profileImage.tempFilePath;
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'user_profiles', 
                public_id: `profile_${userId}`,
                overwrite: true,
            });
            user.profileImage = result.secure_url;
            fs.unlinkSync(filePath); 
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};


module.exports = { updateProfile };
