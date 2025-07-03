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
        // 1. Điều kiện lọc
        const filter = { user: req.user._id };

        // 2. Định nghĩa các tùy chọn populate lồng nhau
        const ticketsPopulateOptions = {
            path: 'tickets',
            select: 'seatNumber price status accessId trip', // Lấy thêm status và accessId
            populate: {
                path: 'trip',
                select: 'departureTime route',
                populate: {
                    path: 'route',
                    select: 'originStation destinationStation distanceKm', // Lấy thêm distanceKm
                    populate: {
                        path: 'originStation destinationStation',
                        select: 'name city'
                    }
                }
            }
        };

        // 3. Thực hiện truy vấn để lấy tất cả các đơn hàng
        const bookings = await Booking.find(filter)
            .populate({ path: 'user', select: 'name phoneNumber email' }) // Populate thông tin người dùng
            .populate({ path: 'provider', select: 'name phone' }) // Populate thông tin nhà xe
            .populate(ticketsPopulateOptions)
            .sort({ createdAt: -1 })
            .lean();

        // 4. Tái cấu trúc dữ liệu trả về
        const formattedBookings = bookings.map(booking => {
            const firstTicket = booking.tickets && booking.tickets[0];
            const tripInfo = firstTicket && firstTicket.trip ? {
                _id: firstTicket.trip._id,
                origin: firstTicket.trip.route?.originStation?.name,
                destination: firstTicket.trip.route?.destinationStation?.name,
                departureTime: firstTicket.trip.departureTime,
                distanceKm: firstTicket.trip.route?.distanceKm
            } : null;

            return {
                
                _id: booking._id,
                totalPrice: booking.totalPrice,
                paymentStatus: booking.paymentStatus,
                approvalStatus: booking.approvalStatus,
                paymentMethod: booking.paymentMethod,
                createdAt: booking.createdAt,    
                userInfo: booking.user,
                providerInfo: booking.provider, // Thêm thông tin nhà xe
                tripInfo: tripInfo,
                tickets: booking.tickets.map(ticket => {
                    const ticketData = {
                        seatNumber: ticket.seatNumber,
                        price: ticket.price,
                        _id: ticket._id,
                    };
                    if (ticket.status === 'booked') {
                        ticketData.accessId = ticket.accessId;
                    }
                    return ticketData;
                })
            };
        });

        // 5. Trả về kết quả không phân trang
        res.status(200).json({
            success: true,
            totalCount: bookings.length,
            data: formattedBookings
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

    //update booking payment info (createDate)
    BookingObj.paymentInfo = {
        transactionDate: createDate,
        amount: amount, 
    };
    await BookingObj.save();
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
    let transactionId = vnp_Params['vnp_TransactionNo'];
    let tsCode = vnp_Params['vnp_TransactionStatus'];
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
                    if(tsCode=="00"){
                        // Thành công
                        booking.paymentStatus = 'completed';
                        booking.approvalStatus = 'confirmed_by_provider'; // Đã được nhà xe duyệt
                    // Thanh toán thành công = đơn hàng được xác nhận
                        booking.bookingExpiresAt = undefined; // Bỏ hạn
                        booking.paymentInfo.transactionId = transactionId; // Lưu transactionId
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
                        booking.approvalStatus = 'cancelled'; // Đơn hàng bị hủy do thanh toán thất bại
                        booking.paymentInfo = null;
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

exports.isBookingRefundable = async (req, res) => {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentStatus !== 'completed' || booking.approvalStatus !== 'approved') {
        return res.status(400).json({ success: false, canRefund: false, reason: 'Đơn hàng không hợp lệ hoặc chưa thanh toán' });
    }
    const tickets = await Ticket.find({ booking: bookingId }).populate('trip');
    if (!tickets || tickets.length === 0) {
        return res.status(400).json({ success: false, canRefund: false, reason: 'Không tìm thấy vé liên quan đến đơn hàng.' });
    }
    for (const ticket of tickets) {
        if (!ticket.trip || ticket.trip.status !== 'scheduled') {
            return res.status(400).json({ success: false, canRefund: false, reason: 'Không thể hoàn tiền cho vé này' });
        }
        const departureTime = ticket.trip.departureTime;
        if (!departureTime) {
            return res.status(400).json({ success: false, canRefund: false, reason: 'Chuyến xe chưa có thời gian khởi hành.' });
        }
        const now = new Date();
        const diffMs = new Date(departureTime) - now;
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours < 12) {
            return res.status(400).json({ success: true, canRefund: false, reason: 'Chỉ được hoàn tiền trước giờ khởi hành ít nhất 12 tiếng.' });
        }
    }
    return res.status(200).json({ success: true, canRefund: true });
};


exports.refundPayment = async (req, res) => {
    const bookingId = req.body.bookingId;

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentStatus !== 'completed' || booking.approvalStatus !== 'approved') {
        return res.status(400).json({ success: false, message: 'Đơn hàng không hợp lệ hoặc chưa thanh toán' });
    }
    // 1. Kiểm tra điều kiện vé có hợp lệ để hoàn tiền không
    const tickets = await Ticket.find({ booking: bookingId }).populate('trip');
    if (!tickets || tickets.length === 0) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy vé liên quan đến đơn hàng.' });
    }
    // Kiểm tra từng vé
    for (const ticket of tickets) {
        if (!ticket.trip || ticket.trip.status !== 'scheduled') {
            return res.status(400).json({ success: false, message: 'không thể hoàn tiền cho vé này' });
        }
        const departureTime = ticket.trip.departureTime;
        if (!departureTime) {
            return res.status(400).json({ success: false, message: 'Chuyến xe chưa có thời gian khởi hành.' });
        }
        const now = new Date();
        const diffMs = new Date(departureTime) - now;
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours < 12) {
            return res.status(400).json({ success: false, message: 'Chỉ được hoàn tiền trước giờ khởi hành ít nhất 12 tiếng.' });
        }
    }

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let config = require('config');
    let crypto = require("crypto");
   
    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');

    let vnp_TxnRef = booking._id.toString(); // Mã đơn hàng, có thể là BookingObj._id hoặc một mã định danh duy nhất khác
    let vnp_TransactionDate = moment(booking.paymentInfo.transactionDate).format('YYYYMMDDHHmmss'); // Ngày giao dịch thanh toán
    let vnp_Amount = booking.paymentInfo.amount * 100; // Số tiền hoàn trả, nhân với 100 để chuyển sang đơn vị đồng (VND)
    let vnp_TransactionType = '02'; // Loại giao dịch là hoàn tiền
    let vnp_CreateBy = booking.user.toString(); // Tên người tạo giao dịch, có thể là tên người dùng hoặc nhà xe
    let currCode = 'VND';
    
    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'refund';
    let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;
            
    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
    
    let vnp_TransactionNo = booking.paymentInfo.transactionId || ''; // Mã giao dịch thanh toán, nếu có
    
    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");
    
     let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TransactionType': vnp_TransactionType,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_Amount': vnp_Amount,
        'vnp_TransactionNo': vnp_TransactionNo,
        'vnp_CreateBy': vnp_CreateBy,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };
    
    request({
        url: vnp_Api,
        method: "POST",
        json: true,   
        body: dataObj
    }, async function (error, response, body) {
        console.log(response);
        if (error) {
            console.error('Error:', error);
            return res.status(500).json({ success: false, message: 'Lỗi khi gửi yêu cầu hoàn tiền', error: error.message });
        }

        if (body && body.vnp_ResponseCode === '00') {
            // Cập nhật trạng thái booking và vé
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
            }

            booking.paymentStatus = 'failed'; // Cập nhật trạng thái thanh toán
            booking.approvalStatus = 'cancelled'; // Cập nhật trạng thái duyệt
            await booking.save();

            await Ticket.updateMany(
                { booking:  booking._id },
                { 
                    $set: { status: 'available' },
                    $unset: { user: "", booking: "" }
                }
            );

            return res.status(200).json({ success: true, message: 'Hoàn tiền thành công', data: body });
        } else {
            return res.status(400).json({ success: false, message: 'Hoàn tiền thất bại', data: body });
        }
    });

};

exports.getBookingPaymentStatus = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId)
            .select('paymentStatus')
           

        if (!booking) {
            return res.status(404).json({ status: 'error', message: 'Booking not found' });
        }
        res.json({ status: 'success', data: booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
}




/**
 * @desc    Người dùng hủy việc giữ chỗ cho MỘT HOẶC NHIỀU vé
 * @route   POST /api/booking/unlock
 * @access  Private (Customer)
 */
exports.unlockTickets = async (req, res) => {
    // Nhận vào một mảng các ticketIds
    const { ticketIds } = req.body;

    try {
        // Sử dụng updateMany để thao tác trên nhiều document cùng lúc
        const result = await Ticket.updateMany(
            {
                _id: { $in: ticketIds }, // Tìm tất cả các vé có ID nằm trong mảng được cung cấp
                user: req.user._id,      // QUAN TRỌNG: Đảm bảo chỉ chủ nhân của lock mới có thể mở
                status: 'locked'         // Chỉ thao tác trên các vé đang bị khóa
            },
            {
                $set: {
                    status: 'available',
                    user: null,
                    lockExpiresAt: null // Hoặc lockExpires tùy theo tên trường của bạn
                }
            }
        );

        // `result.modifiedCount` sẽ cho biết có bao nhiêu vé đã được mở khóa thành công
        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy vé nào đang được bạn giữ hoặc chúng đã hết hạn.'
            });
        }

        res.status(200).json({
            success: true,
            message: `Đã hủy giữ chỗ thành công cho ${result.modifiedCount} vé.`
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server khi hủy giữ chỗ', error: err.message });
    }
};


// === ADMIN MANAGEMENT FUNCTIONS ===

exports.getAllBookings = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filters
        let filter = {};
        if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
        if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
        if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
        if (req.query.provider) filter.provider = req.query.provider;
        if (req.query.user) filter.user = req.query.user;

        let bookings, totalCount;
        if (req.user.role === 'admin') {
            [bookings, totalCount] = await Promise.all([
                Booking.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Booking.countDocuments(filter)
            ]);
        } else {
            [bookings, totalCount] = await Promise.all([
                Booking.find(filter)
                    .populate({ path: 'user', select: 'name email phoneNumber' })
                    .populate({ path: 'provider', select: 'name phoneNumber' })
                    .populate({ 
                        path: 'tickets',
                        select: 'seatNumber price status',
                        populate: {
                            path: 'trip',
                            select: 'departureTime route',
                            populate: {
                                path: 'route',
                                select: 'originStation destinationStation',
                                populate: {
                                    path: 'originStation destinationStation',
                                    select: 'name city'
                                }
                            }
                        }
                    })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Booking.countDocuments(filter)
            ]);
        }

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

exports.getBookingById = async (req, res) => {
    try {
        let booking;
        if (req.user.role === 'admin') {
            booking = await Booking.findById(req.params.id).lean();
        } else {
            booking = await Booking.findById(req.params.id)
                .populate({ path: 'user', select: 'name email phoneNumber' })
                .populate({ path: 'provider', select: 'name phoneNumber email' })
                .populate({ 
                    path: 'tickets',
                    populate: {
                        path: 'trip',
                        populate: [
                            {
                                path: 'route',
                                populate: {
                                    path: 'originStation destinationStation',
                                    select: 'name city address'
                                }
                            },
                            { path: 'vehicle', select: 'type licensePlate' },
                            { path: 'driver', select: 'name phoneNumber' }
                        ]
                    }
                });
        }

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { paymentStatus, approvalStatus } = req.body;
        const updateData = {};
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (approvalStatus) updateData.approvalStatus = approvalStatus;

        let booking;
        if (req.user.role === 'admin') {
            booking = await Booking.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            ).lean();
        } else {
            booking = await Booking.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            )
            .populate({ path: 'user', select: 'name email' })
            .populate({ path: 'provider', select: 'name' });
        }

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Cập nhật đơn hàng thành công.',
            data: booking 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
        }

        // Also update related tickets to available status
        await Ticket.updateMany(
            { _id: { $in: booking.tickets } },
            { 
                $set: { status: 'available' },
                $unset: { user: "", booking: "" }
            }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Xóa đơn hàng thành công.' 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};