

const User = require('../models/user');

// GET /user/me
exports.getMe = async (req, res) => {
    try {
        // req.user is set by the loggedin middleware (from JWT)
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /user/updateMe
exports.updateMe = async (req, res) => {
    try {
        console.log('Request body:', req.body); // Add this line
        const allowedFields = ['name', 'phoneNumber', 'dateOfBirth', 'gender'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update.' });
        }
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Update error:', error); // Add this line
        res.status(400).json({ success: false, message: error.message });
    }
};