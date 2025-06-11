const User = require('../../models/user');
const { hashPassword } = require('../../utils/hashing');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('+password');
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

// Get user by email
exports.getUserByEmail = async (req, res) => {
    const email = req.params.email;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email query parameter is required' });
    }
    try {
        const user = await User.findOne({ email }).select('+password');
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