const Trip = require('../models/trip');
const Provider = require('../models/provider');
const Driver = require('../models/driver');
const Vehicle = require('../models/vehicle');


exports.createTrip = async (req, res) => {
    try {
        // Only admin or provider can create. If provider, set provider field to their provider id.
        let providerId = req.body.provider;
        if (req.user.role === 'provider') {
            // Find provider by mainUser
            const provider = await Provider.findOne({ mainUser: req.user._id });
            if (!provider) return res.status(403).json({ message: 'Provider not found for this user' });
            providerId = provider._id;
        }
        const trip = await Trip.create({ ...req.body, provider: providerId });
        res.status(201).json(trip);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('route')
            .populate('vehicle')
            .populate('driver')
            .populate('provider');
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        // If provider, only allow access to own trips
        if (req.user.role === 'provider' && trip.provider && String(trip.provider._id) !== String(await getProviderId(req.user._id))) {
            return res.status(403).json({ message: 'Forbidden: Not your trip' });
        }
        res.status(200).json(trip);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllTrips = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'provider') {
            // Only show trips for this provider
            const provider = await Provider.findOne({ mainUser: req.user._id });
            if (!provider) return res.status(403).json({ message: 'Provider not found for this user' });
            filter.provider = provider._id;
        }
        const trips = await Trip.find(filter)
            .populate('route')
            .populate('vehicle')
            .populate('driver')
            .populate('provider');
        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTrip = async (req, res) => {
    try {
        let trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        // Only admin or the owning provider can update
        if (req.user.role === 'provider') {
            const provider = await Provider.findOne({ mainUser: req.user._id });
            if (!provider || String(trip.provider) !== String(provider._id)) {
                return res.status(403).json({ message: 'Forbidden: Not your trip' });
            }
        }
        trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('route')
            .populate('vehicle')
            .populate('driver')
            .populate('provider');
        // If status changed to completed, update driver and vehicle currentStation
        if (req.body.status === 'completed') {
            if (trip.driver && trip.route && trip.route.destination_station_id) {
                await Driver.findByIdAndUpdate(trip.driver, { currentStation: trip.route.destination_station_id });
            }
            if (trip.vehicle && trip.route && trip.route.destination_station_id) {
                await Vehicle.findByIdAndUpdate(trip.vehicle, { currentStation: trip.route.destination_station_id });
            }
        }
        res.status(200).json(trip);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        // Only admin or the owning provider can delete
        if (req.user.role === 'provider') {
            const provider = await Provider.findOne({ mainUser: req.user._id });
            if (!provider || String(trip.provider) !== String(provider._id)) {
                return res.status(403).json({ message: 'Forbidden: Not your trip' });
            }
        }
        await Trip.findByIdAndRemove(req.params.id);
        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Helper to get providerId from userId
async function getProviderId(userId) {
    const provider = await Provider.findOne({ mainUser: userId });
    return provider ? provider._id : null;
}
