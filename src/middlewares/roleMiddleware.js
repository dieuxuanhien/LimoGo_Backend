const Provider = require('../models/provider');

// Middleware này chạy sau `loggedin` và `ensureRole`
// Nó tìm thông tin provider nếu user có vai trò là 'provider'
exports.isProvider = async (req, res, next) => {
    // Chỉ thực hiện tìm kiếm nếu vai trò là 'provider'
    if (req.user.role === 'provider') {
        try {
            const provider = await Provider.findOne({ mainUser: req.user._id }).lean();
            if (!provider) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Forbidden: Không tìm thấy thông tin nhà xe cho người dùng này.' 
                });
            }

            // --- THÊM CÁC DÒNG DEBUG NÀY ---
            console.log('--- DEBUG: getProviderInfo Middleware ---');
            console.log('User ID from token:', req.user._id);
            console.log('Found Provider Name:', provider.name);
            console.log('Found Provider ID:', provider._id.toString());
            console.log('------------------------------------');
            // ------------------------------------
            
            // Gắn thông tin provider vào request để các controller sau có thể dùng
            req.provider = provider;
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    // Nếu là admin hoặc vai trò khác, bỏ qua và đi tiếp
    next();
};