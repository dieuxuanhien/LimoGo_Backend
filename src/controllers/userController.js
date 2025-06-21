const User = require('../models/user');
const { hashPassword } = require('../utils/hashing');


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

exports.deleteMe = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        let filter = {};
        if (req.query.email) filter.email = req.query.email;
        if (req.query.phoneNumber) filter.phoneNumber = req.query.phoneNumber;
        if (req.query.userRole) filter.userRole = req.query.userRole;
        if (req.query.verified) filter.verified = req.query.verified;
        if (req.query.name) filter.name = req.query.name;
        if (req.query.dateOfBirth) filter.dateOfBirth = req.query.dateOfBirth;
        if (req.query.gender) filter.gender = req.query.gender;
        console.log('Filter:', filter);
        const users = await User.find(filter).select('+password');
        console.log('Users found:', users.length); // Debug log
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Create user
exports.createUser = async (req, res) => {
    const { name, email, password, phoneNumber, gender, dateOfBirth, userRole, verified } = req.body;
    if (!email || !password || !phoneNumber) {
        return res.status(400).json({ success: false, message: 'Email, password, and phone number are required' });
    }
    try {
        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            dateOfBirth,
            gender,
            userRole: userRole || 'user',
            verified: verified || false,
        });
        await newUser.save();
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, password, phoneNumber, gender, dateOfBirth, userRole , verified } = req.body;
    if (!email || !password || !phoneNumber) {
        return res.status(400).json({ success: false, message: 'Email, password, and phone number are required' });
    }
    try {
        const hashedPassword = await hashPassword(password);
        
        const user = await User.findByIdAndUpdate(
            userId,
            {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                dateOfBirth,
                gender,
                userRole,
                verified,
            },
            { new: true, runValidators: true }
        ).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};