const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ĐĂNG KÝ
router.post('/register', async (req, res) => {
    console.log('\n📝 === ĐĂNG KÝ ===');
    console.log('1️⃣ Nhận dữ liệu từ Frontend:', req.body);

    try {
        const { fullName, email, password, department, position } = req.body;

        // Kiểm tra email đã tồn tại
        console.log('2️⃣ Kiểm tra email trong database...');
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('❌ Email đã tồn tại:', email);
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Tạo user mới
        console.log('3️⃣ Tạo user mới...');
        const user = new User({
            fullName,
            email,
            password, // Sẽ tự động được mã hóa bởi pre-save hook
            department: department || 'Chưa phân công',
            position: position || 'Nhân viên'
        });

        console.log('4 Lưu vào database...');
        await user.save();
        console.log(' User đã được lưu:', user._id);

        // Tạo JWT token
        console.log('5️ Tạo JWT token...');
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(' Đăng ký thành công!\n');

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                department: user.department,
                position: user.position
            }
        });

    } catch (error) {
        console.error(' Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

// ĐĂNG NHẬP
router.post('/login', async (req, res) => {
    console.log('\n === ĐĂNG NHẬP ===');
    console.log('1 Nhận dữ liệu từ Frontend:', { email: req.body.email });

    try {
        const { email, password } = req.body;

        // Tìm user
        console.log('2 Tìm user trong database...');
        const user = await User.findOne({ email });

        if (!user) {
            console.log(' Không tìm thấy user với email:', email);
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        console.log(' Tìm thấy user:', user._id);

        // Kiểm tra mật khẩu
        console.log('3 Kiểm tra mật khẩu...');
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            console.log(' Mật khẩu không đúng');
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        console.log(' Mật khẩu chính xác');

        // Tạo token
        console.log('4 Tạo JWT token...');
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(' Đăng nhập thành công!\n');

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                department: user.department,
                position: user.position
            }
        });

    } catch (error) {
        console.error(' Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

// LẤY THÔNG TIN USER (Protected Route)
router.get('/me', authMiddleware, async (req, res) => {
    console.log('\n👤 === LẤY THÔNG TIN USER ===');
    console.log('1 User ID từ token:', req.userId);

    try {
        console.log('2 Truy vấn database...');
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            console.log(' Không tìm thấy user');
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        console.log(' Tìm thấy user:', user.fullName);
        console.log(' Trả về thông tin user\n');

        res.json(user);
    } catch (error) {
        console.error(' Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// LẤY DANH SÁCH NHÂN VIÊN (Protected Route)
router.get('/employees', authMiddleware, async (req, res) => {
    console.log('\n👥 === LẤY DANH SÁCH NHÂN VIÊN ===');

    try {
        console.log('1 Truy vấn tất cả users...');
        const employees = await User.find().select('-password');

        console.log(` Tìm thấy ${employees.length} nhân viên`);
        console.log(' Trả về danh sách\n');

        res.json(employees);
    } catch (error) {
        console.error(' Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;