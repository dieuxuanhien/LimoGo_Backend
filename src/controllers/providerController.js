const Provider = require('../models/provider');




/*
 name: { type: String, required: true }, // Name of the provider
    email : { type: String, required: true, unique: true }, // Email of the provider
    phone: { type: String, required: true }, // Phone number of the provider
    address: { type: String, required: true }, // Address of the provider
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }, // Status of the provider
    taxId: { type: String, required: false }, // Tax ID of the provider
    mainUser : { type: Schema.Types.ObjectId, ref: 'User', required: true}



*/

exports.getAllProviders = async (req, res) => {
    let filter = {};
    if (req.query.name) filter.name = req.query.name;
    if (req.query.email) filter.email = req.query.email;
    if (req.query.phone) filter.phone = req.query.phone;
    if (req.query.address) filter.address = req.query.address;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.taxId) filter.taxId = req.query.taxId;
    if (req.query.mainUser) filter.mainUser = req.query.mainUser;

    try {
        const providers = await Provider.find(filter).select('+mainUser');
        if (!providers) {
            return res.status(404).json({ success: false, message: 'Providers not found' });
        }
        res.status(200).json({ success: true, data: providers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}


exports.getProviderById = async (req, res) => {
    const { id } = req.params;

    try {
        const provider = await Provider.findById(id).select('+mainUser');
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

    
}


exports.createProvider = async (req, res) => {
    const { name, email, phone, address, status, taxId, mainUser } = req.body;

    try {
        const provider = await Provider.create({ name, email, phone, address, status, taxId, mainUser });
        res.status(201).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}


exports.updateProvider = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, status, taxId, mainUser } = req.body;

    try {
        const provider = await Provider.findByIdAndUpdate(id, { name, email, phone, address, status, taxId, mainUser }, { new: true, runValidators: true });
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
}


exports.deleteProvider = async (req, res) => {
    const { id } = req.params;

    try {
        const provider = await Provider.findByIdAndDelete(id);
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, message: 'Provider deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
}


exports.getProviderByMainUser = async (req, res) => {
    const { mainUser } = req.params;

    try {
        const provider = await Provider.findOne({ mainUser }).select('+mainUser');
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
}


exports.getProviderByCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user ID is available in req.user
        const provider = await Provider.findOne({ mainUser: userId }).select('+mainUser');
        
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.updateProviderByCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user ID is available in req.user
        const provider = await Provider.findOneAndUpdate(
            { mainUser: userId },
            req.body,
            { new: true, runValidators: true }
        ).select('+mainUser');
        
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}