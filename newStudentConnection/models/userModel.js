const { db } = require('../firebaseAdmin');

const UserModel = {
  // Tạo hoặc cập nhật thông tin người dùng
  async upsertUser({ uid, email, userName, role = 'user',createdAt = new Date() }) {
    await db.collection('users').doc(uid).set({
      uid,
      email,
      userName,
      role,
      createdAt
    }, { merge: true });
    return { uid, email, userName, role, createdAt };
  },

  // Lấy thông tin người dùng theo uid
  async getUserByUid(uid) {
    const docRef = db.collection('users').doc(uid);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      throw new Error('Người dùng không tồn tại.');
    }
    return docSnap.data();
  },

  // Lấy danh sách tất cả người dùng (giới hạn 100)
  async getAllUsers(limitNumber = 100) {
    const snapshot = await db.collection('users').limit(limitNumber).get();
    return snapshot.docs.map(doc => doc.data());
  },

  // Xóa người dùng theo uid
  async deleteUser(uid) {
    await db.collection('users').doc(uid).delete();
    return { message: 'Đã xóa người dùng', uid };
  },

  // Cập nhật thông tin người dùng
  async updateUser(uid, data) {
    await db.collection('users').doc(uid).update(data);
    return { message: 'Đã cập nhật người dùng', uid };
  }
};

module.exports = UserModel;
