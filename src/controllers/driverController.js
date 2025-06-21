const Driver = require('../models/driver');
const Provider = require('../models/provider');

// Get all drivers (admin sees all, provider sees their own)
exports.getAllDrivers = async (req, res) => {
    let filter = {};
    if (req.user.role === 'provider') {
        const provider = await Provider.findOne({ mainUser: req.user._id });
        if (!provider) return res.status(403).json({ success: false, message: 'Provider not found for this user' });
        filter.provider = provider._id;
    }
    if (req.query.name) filter.name = req.query.name;
    if (req.query.currentStation) filter.currentStation = req.query.currentStation;
    if (req.query.age) filter.age = req.query.age;
    if (req.query.status) filter.status = req.query.status;
    try {
        const drivers = await Driver.find(filter).populate('currentStation provider');
        res.status(200).json({ success: true, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get driver by ID (admin any, provider only their own)
exports.getDriverById = async (req, res) => {
    const { id } = req.params;
    try {
        const driver = await Driver.findById(id).populate('currentStation provider');
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        if (req.user.role === 'provider' && String(driver.provider) !== String(await getProviderId(req.user._id))) {
            return res.status(403).json({ success: false, message: 'Forbidden: Not your driver' });
        }
        res.status(200).json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create driver (admin any, provider only for themselves)
exports.createDriver = async (req, res) => {
    try {
        let providerId = req.body.provider;
        if (req.user.role === 'provider') {
            const provider = await Provider.findOne({ mainUser: req.user._id });
            if (!provider) return res.status(403).json({ success: false, message: 'Provider not found for this user' });
            providerId = provider._id;
        }
        const { name, currentStation, age, status } = req.body;
        if (!name || !providerId || !age) {
            return res.status(400).json({ success: false, message: 'Name, provider, and age are required' });
        }
        let photo = req.file ? req.file.url : null;
        const driver = await Driver.create({ name, currentStation, provider: providerId, age, photo, status: status || 'available' });
        res.status(201).json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update driver (admin any, provider only their own)
exports.updateDriver = async (req, res) => {
    const { id } = req.params;
    try {
        const driver = await Driver.findById(id);
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        if (req.user.role === 'provider' && String(driver.provider) !== String(await getProviderId(req.user._id))) {
            return res.status(403).json({ success: false, message: 'Forbidden: Not your driver' });
        }
        let photo = req.file ? req.file.url : driver.photo;
        const updated = await Driver.findByIdAndUpdate(id, { ...req.body, photo }, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete driver (admin any, provider only their own)
exports.deleteDriver = async (req, res) => {
    const { id } = req.params;
    try {
        const driver = await Driver.findById(id);
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        if (req.user.role === 'provider' && String(driver.provider) !== String(await getProviderId(req.user._id))) {
            return res.status(403).json({ success: false, message: 'Forbidden: Not your driver' });
        }
        await Driver.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Driver deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all drivers for current provider
exports.getDriverByCurrentProvider = async (req, res) => {
    try {
        const provider = await Provider.findOne({ mainUser: req.user._id });
        if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
        const drivers = await Driver.find({ provider: provider._id }).populate('currentStation provider');
        res.status(200).json({ success: true, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper to get providerId from userId
async function getProviderId(userId) {
    const provider = await Provider.findOne({ mainUser: userId });
    return provider ? provider._id : null;
}

// To be called from tripController on trip completion
exports.updateDriverStation = async (driverId, stationId) => {
    await Driver.findByIdAndUpdate(driverId, { currentStation: stationId });
};
