const { db } = require('../firebaseAdmin');
const admin = require('firebase-admin');

const QuestionModel = {
  async getLatestQuestions(limitNumber = 10) {
    const questionsRef = db.collection('questions');
    const snapshot = await questionsRef.orderBy('createdAt', 'desc').limit(limitNumber).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async addQuestion({ title, content, tags, userId, userName, other = '' }) {
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const docRef = await db.collection('questions').add({
      title,
      content,
      tags: tagsArray,
      userId,
      userName,
      other,
      createdAt: new Date(),
      answerCount: 0,
      upvotes: 0,
      downvotes: 0,
    });
    return { id: docRef.id };
  },
  async getQuestionById(questionId) {
    const docRef = db.collection('questions').doc(questionId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      throw new Error('Câu hỏi không tồn tại.');
    }
    return { id: docSnap.id, ...docSnap.data() };
  },
  async deleteQuestion(id) {
    await db.collection('questions').doc(id).delete();
    return { message: 'Đã xóa câu hỏi', id };
  },
  // Cập nhật thông tin câu hỏi
  async updateQuestion(id, data) {
    await db.collection('questions').doc(id).update(data);
    return { message: 'Đã cập nhật câu hỏi', id };
  },
  // Like (upvote) question
  async likeQuestion(id) {
    const ref = db.collection('questions').doc(id);
    await ref.update({ upvotes: admin.firestore.FieldValue.increment(1) });
    return { message: 'Đã like câu hỏi', id };
  },
  // Dislike (downvote) question
  async dislikeQuestion(id) {
    const ref = db.collection('questions').doc(id);
    await ref.update({ downvotes: admin.firestore.FieldValue.increment(1) });
    return { message: 'Đã dislike câu hỏi', id };
  },
  // Tìm kiếm câu hỏi theo title hoặc tag
  async searchQuestions({ q, tag, limitNumber = 20 }) {
    let query = db.collection('questions');
    if (q) {
      // Firestore không hỗ trợ search full-text, nên sẽ lọc sau khi lấy dữ liệu
      query = query.orderBy('createdAt', 'desc').limit(100);
      const snapshot = await query.get();
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      results = results.filter(qs =>
        qs.title && qs.title.toLowerCase().includes(q.toLowerCase())
      );
      if (tag) {
        results = results.filter(qs => Array.isArray(qs.tags) && qs.tags.includes(tag));
      }
      return results.slice(0, limitNumber);
    } else if (tag) {
      // Tìm theo tag (chính xác)
      query = query.where('tags', 'array-contains', tag).orderBy('createdAt', 'desc').limit(limitNumber);
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      // Không có điều kiện, trả về rỗng
      return [];
    }
  }
};

module.exports = QuestionModel;
