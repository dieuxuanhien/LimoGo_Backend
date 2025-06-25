// src/utils/helpers.js
/**
 * Lọc một đối tượng chỉ giữ lại các trường được chỉ định.
 * @param {object} obj - Đối tượng cần lọc.
 * @param  {...string} allowedFields - Danh sách các trường được phép giữ lại.
 * @returns {object} - Đối tượng mới đã được lọc.
 */
exports.filterObject = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};