const UserModel = require('../models/userModel');

const UserController = {
  // Lấy danh sách tất cả người dùng
  async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy thông tin người dùng theo uid
  async getUserByUid(req, res) {
    try {
      const { uid } = req.params;
      const user = await UserModel.getUserByUid(uid);
      res.json(user);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  // Xóa người dùng theo uid
  async deleteUser(req, res) {
    try {
      const { uid } = req.params;
      const result = await UserModel.deleteUser(uid);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Cập nhật thông tin người dùng
  async updateUser(req, res) {
    try {
      const { uid } = req.params;
      const data = req.body;
      const result = await UserModel.updateUser(uid, data);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = UserController;
