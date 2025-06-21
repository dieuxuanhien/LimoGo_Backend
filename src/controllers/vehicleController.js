const Vehicle = require('../models/vehicle');
const Provider = require('../models/provider');

// Get all vehicles (admin sees all, provider sees their own)
exports.getAllVehicles = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'provider') {
            const provider = await Provider.findOne({ mainUser: req.user._id });
            if (!provider) return res.status(403).json({ success: false, message: 'Provider not found for this user' });
            filter.provider = provider._id;
        }
        const vehicles = await Vehicle.find(filter).populate('currentStation');
        res.status(200).json({ success: true, data: vehicles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

// Get vehicle by ID (admin any, provider only their own)
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('currentStation');
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        if (req.user.role === 'provider' && String(vehicle.provider) !== String(await getProviderId(req.user._id))) {
            return res.status(403).json({ success: false, message: 'Forbidden: Not your vehicle' });
        }
        res.status(200).json({ success: true, data: vehicle });
    } catch (err) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
};

// Create vehicle (admin any, provider only for themselves)
exports.createVehicle = async (req, res) => {
    try {
        let providerId = req.body.provider;
        if (req.user.role === 'provider') {
            const provider = await Provider.findOne({ mainUser: req.user._id });
            if (!provider) return res.status(403).json({ success: false, message: 'Provider not found for this user' });
            providerId = provider._id;
        }
        const { type, currentStation, licensePlate, status, capacity, manufacturer, model } = req.body;
        let image = req.file ? req.file.url : req.body.image;
        if (!type || !currentStation || !licensePlate || !capacity) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const vehicle = await Vehicle.create({ type, currentStation, licensePlate, status, capacity, manufacturer, model, image, provider: providerId });
        res.status(201).json({ success: true, data: vehicle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Something went wrong' });
    }
};

// Update vehicle (admin any, provider only their own)
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('currentStation');
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        if (req.user.role === 'provider' && String(vehicle.provider) !== String(await getProviderId(req.user._id))) {
            return res.status(403).json({ success: false, message: 'Forbidden: Not your vehicle' });
        }
        let image = req.file ? req.file.url : req.body.image || vehicle.image;
        const updateData = { ...req.body, image };
        const updated = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('currentStation');
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
};

// Delete vehicle (admin any, provider only their own)
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        if (req.user.role === 'provider' && String(vehicle.provider) !== String(await getProviderId(req.user._id))) {
            return res.status(403).json({ success: false, message: 'Forbidden: Not your vehicle' });
        }
        await Vehicle.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
};

// Helper to get providerId from userId
async function getProviderId(userId) {
    const provider = await Provider.findOne({ mainUser: userId });
    return provider ? provider._id : null;
}
