// src/utils/bookingHelpers.js
const mongoose = require('mongoose');

/**
 * Kiểm tra xem một chặng mới có chồng chéo với các chặng đã được đặt trước đó trên cùng một ghế không.
 *
 * @param {Array<string>} itineraryStopsOrdered - Mảng ID của các trạm dừng trong hành trình, đã được sắp xếp theo thứ tự.
 * @param {mongoose.Types.ObjectId} requestedOriginId - ID của điểm đi mà người dùng muốn đặt.
 * @param {mongoose.Types.ObjectId} requestedDestinationId - ID của điểm đến mà người dùng muốn đặt.
 * @param {Array<Object>} existingBookedTicketsForSeat - Mảng các vé đã đặt (status: 'booked' hoặc 'pending_approval')
 * cho cùng một ghế, chứa trường 'segment'.
 * @returns {boolean} - True nếu có chồng chéo (ghế KHÔNG khả dụng), False nếu KHÔNG có chồng chéo (ghế khả dụng).
 */
exports.isSeatSegmentOverlapped = (itineraryStopsOrdered, requestedOriginId, requestedDestinationId, existingBookedTicketsForSeat) => {
    const reqOriginIdx = itineraryStopsOrdered.indexOf(String(requestedOriginId));
    const reqDestIdx = itineraryStopsOrdered.indexOf(String(requestedDestinationId));

    // Nếu chặng yêu cầu không hợp lệ trên hành trình (điểm đi = điểm đến, hoặc điểm đi sau điểm đến)
    if (reqOriginIdx === -1 || reqDestIdx === -1 || reqOriginIdx >= reqDestIdx) {
        // Đây là lỗi validation chứ không phải lỗi chồng chéo, nhưng ta trả về true để báo ghế không khả dụng.
        // Thực tế, điều này lẽ ra phải được bắt bởi validator trước đó.
        return true; 
    }

    for (const existingTicket of existingBookedTicketsForSeat) {
        const existingSegment = existingTicket.segment;
        if (!existingSegment || !existingSegment.originStop || !existingSegment.destinationStop) {
            // Nếu vé hiện có không có thông tin segment (có thể là vé cũ chưa được cập nhật schema)
            // hoặc dữ liệu không đầy đủ, ta coi là chiếm chỗ để an toàn.
            console.warn(`Vé ${existingTicket._id} thiếu thông tin segment. Coi là chiếm chỗ.`);
            return true; 
        }

        const existingOriginIdx = itineraryStopsOrdered.indexOf(String(existingSegment.originStop));
        const existingDestIdx = itineraryStopsOrdered.indexOf(String(existingSegment.destinationStop));

        // Kiểm tra chồng chéo:
        // Chặng mới (reqOriginIdx -> reqDestIdx)
        // Chặng hiện có (existingOriginIdx -> existingDestIdx)
        // Chồng chéo nếu: (reqOriginIdx < existingDestIdx) AND (reqDestIdx > existingOriginIdx)
        if (reqOriginIdx < existingDestIdx && reqDestIdx > existingOriginIdx) {
            return true; // Có chồng chéo
        }
    }

    return false; // Không có chồng chéo với bất kỳ vé đã đặt nào
};