// src/controllers/bookingController.js
const Ticket = require('../models/ticket');
const Booking = require('../models/booking');
const Trip = require('../models/trip');
const mongoose = require('mongoose');
let $ = require('jquery');
const request = require('request');
const moment = require('moment');
const { log } = require('console');
const { sortObject } = require('../utils/sortObject');
// API: POST /booking/lock - Khóa ghế
exports.lockSeat = async (req, res) => {
    const { ticketId } = req.body;
    try {
        const now = new Date();
        const ticket = await Ticket.findOneAndUpdate(
            { 
                _id: ticketId,
                $or: [
                    { status: 'available' },
                    { status: 'locked', lockExpires: { $lt: now } }
                ]
            },
            { 
                $set: { 
                    status: 'locked', 
                    user: req.user._id, 
                    lockExpires: new Date(now.getTime() + 10 * 60 * 1000) // Khóa trong 10 phút
                } 
            },
            { new: true }
        );

        if (!ticket) {
            return res.status(409).json({ success: false, message: 'Ghế này vừa được người khác giữ hoặc đã được đặt. Vui lòng thử lại.' });
        }
        res.status(200).json({ success: true, message: 'Giữ chỗ thành công trong 10 phút.', data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server khi giữ chỗ', error: err.message });
    }
};

// API: POST /booking/lock-many - Khóa nhiều ghế cùng lúc
exports.lockMultipleSeats = async (req, res) => {
    const { ticketIds } = req.body; // Nhận một mảng các ticketId
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            throw new Error('ticketIds phải là một mảng và không được rỗng.');
        }

        const now = new Date();
        const lockExpires = new Date(now.getTime() + 10 * 60 * 1000); // Khóa trong 10 phút

        // 1. Cập nhật tất cả các vé hợp lệ trong một lần
        const result = await Ticket.updateMany(
            {
                _id: { $in: ticketIds },
                $or: [
                    { status: 'available' },
                    { status: 'locked', lockExpires: { $lt: now } }
                ]
            },
            {
                $set: {
                    status: 'locked',
                    user: req.user._id,
                    lockExpires: lockExpires
                }
            },
            { session }
        );

        // 2. Kiểm tra xem có khóa đủ số lượng ghế yêu cầu không
        if (result.matchedCount !== ticketIds.length || result.modifiedCount !== ticketIds.length) {
            // Nếu không, rollback và báo lỗi
            throw new Error('Một hoặc nhiều ghế bạn chọn không hợp lệ hoặc đã được người khác giữ. Vui lòng thử lại.');
        }

        // 3. Lấy thông tin các vé vừa khóa thành công
        const lockedTickets = await Ticket.find({ _id: { $in: ticketIds }, user: req.user._id }).session(session);

        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: `Giữ chỗ thành công ${lockedTickets.length} ghế trong 10 phút.`,
            data: lockedTickets
        });

    } catch (err) {
        await session.abortTransaction();
        // Phân biệt lỗi do người dùng và lỗi server
        if (err.message.includes('Một hoặc nhiều ghế')) {
             res.status(409).json({ success: false, message: err.message }); // 409 Conflict
        } else {
             res.status(500).json({ success: false, message: 'Lỗi server khi giữ chỗ', error: err.message });
        }
    } finally {
        session.endSession();
    }
};


// API: POST /booking/confirm - Xác nhận đặt vé
exports.confirmBooking = async (req, res) => {
    // 1. Lấy dữ liệu từ body
    const { ticketIds, paymentMethod } = req.body;
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Tìm và xác thực các vé đã được khóa bởi người dùng
        const tickets = await Ticket.find({
            _id: { $in: ticketIds },
            user: req.user._id,
            status: 'locked'
        }).populate('trip').session(session);

        if (tickets.length !== ticketIds.length || tickets.length === 0) {
            throw new Error('Một hoặc nhiều vé không hợp lệ hoặc đã hết hạn giữ chỗ.');
        }

        // 3. Chuẩn bị dữ liệu chung cho đơn hàng
        const providerId = tickets[0].trip.provider;
        const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

        const bookingData = {
            user: req.user._id,
            tickets: ticketIds,
            totalPrice: totalPrice,
            provider: providerId,
            paymentMethod: paymentMethod,
            approvalStatus: 'pending_approval', 
            paymentStatus: 'pending',
        };
        
        // 4. Xử lý logic khác nhau cho từng phương thức thanh toán
        let successMessage = '';
        if (paymentMethod === 'cash') {
            // Với tiền mặt, cho nhà xe 1 giờ để duyệt
            bookingData.bookingExpiresAt = new Date(Date.now() + 60 * 60 * 1000); 
            successMessage = 'Yêu cầu đặt vé đã được gửi, vui lòng chờ nhà xe xác nhận.';
        } else if (paymentMethod === 'bank_transfer') {
            // Với chuyển khoản, cho người dùng 15 phút để thanh toán
            bookingData.bookingExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
            successMessage = 'Đơn hàng đã được tạo, hãy tiến hành thanh toán để hoàn tất.';
        }
        
        // 5. Tạo đơn hàng mới
        const [savedBooking] = await Booking.create([bookingData], { session });

        // 6. Cập nhật trạng thái vé
        await Ticket.updateMany(
            { _id: { $in: ticketIds } },
            { 
                $set: { 
                    status: 'pending_approval', // Chuyển sang chờ duyệt
                    booking: savedBooking._id
                },
                $unset: { lockExpires: "" }
            },
            { session }
        );
        
        await session.commitTransaction();
        res.status(201).json({ success: true, message: successMessage, data: savedBooking });

    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
};



// --- HÀM MỚI CHO NHÀ XE DUYỆT VÉ ---
exports.approveBooking = async (req, res) => {
    const { bookingId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Tìm đơn hàng đang chờ duyệt của nhà xe
        const booking = await Booking.findOne({
            _id: bookingId,
            provider: req.provider._id, // Đảm bảo đúng nhà xe duyệt
            approvalStatus: 'pending_approval'
        }).session(session);

        if (!booking) {
            throw new Error('Đơn hàng không tồn tại, đã được xử lý hoặc không thuộc quyền quản lý của bạn.');
        }

        // 2. THAY ĐỔI: Chỉ cho phép duyệt các đơn hàng trả tiền mặt qua API này
        if (booking.paymentMethod !== 'cash') {
            throw new Error('API này chỉ dùng để duyệt các đơn hàng thanh toán tiền mặt (cash).');
        }

        // 3. THAY ĐỔI: Cập nhật trạng thái theo logic mới
        booking.approvalStatus = 'confirmed_by_provider'; // Đã được nhà xe duyệt
        booking.paymentStatus = 'pending'; // Trạng thái thanh toán vẫn là 'chờ' (sẽ được cập nhật thủ công sau)
        booking.bookingExpiresAt = undefined; // Bỏ đi hạn duyệt vì đã được duyệt
        await booking.save({ session });

        // 4. Cập nhật các vé liên quan thành đã đặt (booked)
        await Ticket.updateMany(
            { _id: { $in: booking.tickets } },
            { $set: { status: 'booked' } }
        ).session(session);

        await session.commitTransaction();
        res.status(200).json({ success: true, message: 'Đơn hàng đã được duyệt thành công.', data: booking });

    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
};


exports.getMyBookings = async (req, res) => {
    try {
        // 1. Logic Phân trang: Lấy giá trị từ query hoặc dùng giá trị mặc định
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;

        // 2. Điều kiện lọc: Chỉ lấy các booking của user đang đăng nhập
        const filter = { user: req.user._id };

        // 3. Thực hiện 2 truy vấn song song: một để lấy dữ liệu, một để đếm tổng số
        // Định nghĩa các tùy chọn populate cho từng cấp
        const stationPopulateOptions = { 
            path: 'originStation destinationStation', 
            select: 'name city' 
        };

        const routePopulateOptions = { 
            path: 'route', 
            select: 'originStation destinationStation', 
            populate: stationPopulateOptions 
        };

        const tripPopulateOptions = { 
            path: 'trip', 
            select: 'departureTime arrivalTime route', 
            populate: routePopulateOptions 
        };

        const ticketsPopulateOptions = {
            path: 'tickets',
            select: 'seatNumber price trip',
            populate: tripPopulateOptions
        };

        const [ bookings, totalCount ] = await Promise.all([
                Booking.find(filter)
                    .populate(ticketsPopulateOptions)
                    .sort({ createAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Booking.countDocuments(filter)  
        ]);

        // 4. Trả về kết quả có cấu trúc phân trang
        res.status(200).json({
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};



/// Payment creating. AI GENERATIVE MODEL PLEASE DONT TOUCH THIS FUNCTION
exports.createPaymentUrl = async (req, res) => {
    try {
        const bookingId = req.body.bookingId;
        let BookingObj;
        BookingObj = await Booking.findById(bookingId);
        if (!BookingObj || BookingObj.paymentStatus != 'pending') {
            return res.status(404).json({ success: false, message: 'Đơn hàng không hợp lệ hoặc đã thanh toán' });
        }
    //
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let config = require('config');
    
    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnpUrl = config.get('vnp_Url');
    let returnUrl = config.get('vnp_ReturnUrl');
    let orderId = BookingObj._id; // Mã đơn hàng, có thể là BookingObj._id hoặc một mã định danh duy nhất khá
    let amount = BookingObj.totalPrice; // Số tiền thanh toán từ BookingObj
    let bankCode = "";

    let locale = '';
    if(locale === null || locale === ''){
        locale = 'vn';
    }
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    //
    res.status(200).json({success: true, data: vnpUrl, message: 'Tạo URL thanh toán thành công.'});
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Lỗi server khi tạo URL thanh toán.', error: err.message });
    }

}

// HANDLE IPN (Instant Payment Notification) from VNPAY AI GENERATIVE MODEL PLEASE DONT TOUCH THIS FUNCTION
exports.handleIpnResponse = async (req, res) => {

    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let config = require('config');
    let secretKey = config.get('vnp_HashSecret');
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
    
    //let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó
    
    //let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    //let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
if(secureHash === signed){ //kiểm tra checksum
    // Tìm booking theo orderId
    const booking = await Booking.findById(orderId);
    if(booking){
        // Kiểm tra hết hạn booking
        if (booking.bookingExpiresAt && new Date() > booking.bookingExpiresAt) {
            // Nếu đã hết hạn thì không cập nhật trạng thái, trả về mã 04
            res.status(200).json({RspCode: '04', Message: 'Order expired'});
            return;
        }
        // Kiểm tra số tiền
        let amount = parseInt(vnp_Params['vnp_Amount']) / 100;
        if(booking.totalPrice === amount){
            // Kiểm tra trạng thái đã cập nhật chưa
            if(booking.paymentStatus !== 'completed' && booking.paymentStatus !== 'failed'){
                const session = await mongoose.startSession();
                session.startTransaction();
                try {
                    if(rspCode=="00"){
                        // Thành công
                        booking.paymentStatus = 'completed';
                    // Thanh toán thành công = đơn hàng được xác nhận
                        booking.bookingExpiresAt = undefined; // Bỏ hạn
                        await booking.save({ session });

                        // Cập nhật trạng thái các vé liên quan
                        await Ticket.updateMany(
                            { _id: { $in: booking.tickets } },
                            { $set: { status: 'booked' } },
                            { session }
                        );

                        await session.commitTransaction();
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                    else {
                        // Thất bại
                        booking.paymentStatus = 'failed';
                        await booking.save({ session });
                        await session.commitTransaction();
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                } catch (error) {
                    await session.abortTransaction();
                    // Trả về mã lỗi để VNPAY retry
                    res.status(200).json({RspCode: '99', Message: 'Update failed, please retry'});
                } finally {
                    session.endSession();
                }
            }
            else{
                res.status(200).json({RspCode: '02', Message: 'This order has been updated to the payment status'})
            }
        }
        else{
            res.status(200).json({RspCode: '04', Message: 'Amount invalid'})
        }
    }       
    else {
        res.status(200).json({RspCode: '01', Message: 'Order not found'})
    }
}
else {
    res.status(200).json({RspCode: '97', Message: 'Checksum failed'})
}


}


// HANDLE RETURN RESPONSE from VNPAY AI GENERATIVE MODEL PLEASE DONT TOUCH THIS FUNCTION
exports.handleReturnResponse = async (req, res) => {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let config = require('config');
    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     

    if(secureHash === signed){
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

        res.json({status: 'success', code: vnp_Params['vnp_ResponseCode']})
    } else{
        res.json({status: 'error', code: '97'})
    }


}