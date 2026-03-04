const admin = require('../firebaseAdmin').admin;
const UserModel = require('../models/userModel');

const AuthController = {
  // Đăng ký tài khoản mới
  async register(req, res) {
    try {
      const { email, password, userName } = req.body;
      if (!email || !password || !userName) {
        return res.status(400).json({ error: 'Thiếu thông tin đăng ký.' });
      }
      // Tạo user mới trên Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: userName,
      });
      // Lưu thông tin user vào Firestore qua userModel
      const userDoc = await UserModel.upsertUser({
        uid: userRecord.uid,
        email: userRecord.email,
        userName: userRecord.displayName,
        createdAt: new Date(),
        role: 'user',
      });
      console.log('Lưu user vào Firestore thành công:', userDoc);
      res.json({ message: 'Đăng ký thành công', uid: userRecord.uid });
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      res.status(500).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
        // Lấy token từ header Authorization hoặc body
        const idToken = req.headers.authorization?.split('Bearer ')[1] || req.body.idToken;
        if (!idToken) {
        return res.status(400).json({ error: 'Thiếu ID token.' });
        }
        // Xác thực token bằng Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Lấy thông tin user từ Firestore (nếu có)
        let userInfo = null;
        try {
        userInfo = await UserModel.getUserByUid(decodedToken.uid);
        } catch (e) {
        // Nếu chưa có user trong Firestore, chỉ trả uid
        userInfo = { uid: decodedToken.uid };
        }
        res.json({ message: 'Xác thực thành công', user: userInfo, decodedToken });
    } catch (err) {
        res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
    }
};

module.exports = AuthController;
