const Review = require('../models/review');
const Trip = require('../models/trip');
const Ticket = require('../models/ticket');

/**
 * @desc    Tạo một đánh giá mới
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
// Thay thế hàm createReview cũ
exports.createReview = async (req, res) => {
    try {
        const { tripId, rating, comment } = req.body;
        const userId = req.user._id;

        // --- Tối ưu hóa bằng cách chạy song song 2 truy vấn ---
        const [existingReview, bookedTicket] = await Promise.all([
            Review.findOne({ trip: tripId, user: userId }).lean(), // Dùng lean() cho truy vấn chỉ đọc
            Ticket.findOne({ user: userId, trip: tripId, status: 'booked' })
                  .populate({ path: 'trip', select: 'status' }) // Chỉ populate để lấy status của trip
                  .lean()
        ]);
        
        // --- Kiểm tra các quy tắc nghiệp vụ dựa trên kết quả trả về ---

        // 1. Kiểm tra xem user đã đánh giá chuyến đi này chưa
        if (existingReview) {
            return res.status(409).json({ success: false, message: 'Bạn đã đánh giá chuyến đi này rồi.' });
        }

        // 2. Kiểm tra xem user có vé đã đặt cho chuyến đi này không
        if (!bookedTicket) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền đánh giá chuyến đi này vì chưa hoàn thành chuyến đi.' });
        }

        // 3. Kiểm tra xem chuyến đi đã hoàn thành chưa
        if (bookedTicket.trip.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá các chuyến đi đã hoàn thành.' });
        }

        // --- Nếu tất cả điều kiện đều thỏa mãn, tạo review mới ---
        const newReview = await Review.create({
            trip: tripId,
            user: userId,
            rating,
            comment
        });

        res.status(201).json({ success: true, message: 'Tạo đánh giá thành công!', data: newReview });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};


/**
 * @desc    Lấy tất cả đánh giá (cho Admin)
 * @route   GET /api/reviews
 * @access  Private (Admin)
 */
exports.getAllReviews = async (req, res) => {
    try {
        // Logic Phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [reviews, totalCount] = await Promise.all([
            Review.find({})
                .populate('user', 'name email') // Lấy thông tin người dùng
                .populate('trip') // Lấy thông tin chuyến đi
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({})
        ]);

        res.status(200).json({
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: reviews
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Cập nhật đánh giá
 * @route   PATCH /api/reviews/:reviewId
 * @access  Private (Chủ sở hữu đánh giá)
 */
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const updatedReview = await Review.findOneAndUpdate(
            { _id: reviewId, user: req.user._id }, // Chỉ tìm thấy nếu ID đúng VÀ user là chủ sở hữu
            { $set: { rating, comment } },
            { new: true, runValidators: true }        
        );

        if (!updatedReview){
            return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá hoặc bạn không có quyền sửa.' });
        }

        res.status(200).json({ success: true, message: 'Cập nhật đánh giá thành công.', data: updatedReview });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};


/**
 * @desc    Xóa một đánh giá
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (Chủ sở hữu hoặc Admin)
 */
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        let deletedReview;

        // Nếu là admin, họ có thể xóa bất kỳ review nào
        if (req.user.role === 'admin') {
            deletedReview = await Review.findByIdAndDelete(reviewId);
        } else {
            // Nếu là customer, họ chỉ có thể xóa review của chính mình
            deletedReview = await Review.findOneAndDelete({ _id: reviewId, user: req.user._id });
        }

        if (!deletedReview) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa.' });
        }

         res.status(200).json({ success: true, message: 'Xóa đánh giá thành công.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};