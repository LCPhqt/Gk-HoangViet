const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

module.exports = function (req, res, next) {
    // Lấy token từ header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('🔐 Middleware Auth - Token:', token ? 'Có' : 'Không có');

    // Kiểm tra có token không
    if (!token) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }

    try {
        // Xác thực token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token hợp lệ, User ID:', decoded.userId);

        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('❌ Token không hợp lệ:', error.message);
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};