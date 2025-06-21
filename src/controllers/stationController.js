const Station = require('../models/station');


// Get all stations (all roles)
exports.getAllStations = async (req, res) => {
    try {
        const stations = await Station.find();
        res.status(200).json({ success: true, data: stations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get station by ID (all roles)
exports.getStationById = async (req, res) => {
    const { id } = req.params;
    try {
        const station = await Station.findById(id);
        if (!station) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        res.status(200).json({ success: true, data: station });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new station (admin only)
exports.createStation = async (req, res) => {
    const { name, city, country, coordinates } = req.body;
    if (!name || !city) {
        return res.status(400).json({ success: false, message: 'Name and city are required' });
    }
    try {
        const exists = await Station.findOne({ name });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Station name already exists' });
        }
        const newStation = new Station({
            name,
            city,
            country: country || 'VietNam',
            coordinates
        });
        await newStation.save();
        res.status(201).json({ success: true, data: newStation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an existing station (admin only)
exports.updateStation = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedStation = await Station.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedStation) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        res.status(200).json({ success: true, data: updatedStation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a station (admin only)
exports.deleteStation = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedStation = await Station.findByIdAndDelete(id);
        if (!deletedStation) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        res.status(200).json({ success: true, message: 'Station deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

