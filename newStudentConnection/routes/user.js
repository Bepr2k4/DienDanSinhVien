const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const verifyFirebaseToken = require('../middlewares/authMiddleware');

// Lấy danh sách tất cả người dùng (yêu cầu xác thực)
router.get('/', verifyFirebaseToken, UserController.getAllUsers);

// Lấy thông tin người dùng theo uid (yêu cầu xác thực)
router.get('/:uid', verifyFirebaseToken, UserController.getUserByUid);

// Cập nhật thông tin người dùng theo uid (yêu cầu xác thực)
router.put('/:uid', verifyFirebaseToken, UserController.updateUser);

// Xóa người dùng theo uid (yêu cầu xác thực)
router.delete('/:uid', verifyFirebaseToken, UserController.deleteUser);

module.exports = router;
