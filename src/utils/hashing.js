const bcrypt = require('bcryptjs');
const crypto = require('crypto');
exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error('Error hashing password');
    }
}

exports.comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error('Error comparing password');
    }
}


exports.hmacProcess = (data, secret) => {
     const result = crypto.createHmac('sha256', secret).update(data).digest('hex');
     return result;
}