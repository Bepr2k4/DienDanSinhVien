const { db } = require('../firebaseAdmin');
const admin = require('firebase-admin');

const AnswerModel = {
  // Thêm câu trả lời vào subcollection answers của một câu hỏi
  async addAnswer(questionId, { content, userId, userName }) {
    const answersRef = db.collection('questions').doc(questionId).collection('answers');
    const docRef = await answersRef.add({
      content,
      userId,
      userName,
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0
    });
    // Tăng answerCount của question lên 1, chỉ dùng 1 lệnh update
    try {
      await db.collection('questions').doc(questionId).update({
        answerCount: require('../firebaseAdmin').admin.firestore.FieldValue.increment(1)
      });
    } catch (err) {
      console.error('Không thể tăng answerCount cho question:', questionId, err.message);
    }
    return { id: docRef.id };
  },

  // Lấy danh sách câu trả lời của một câu hỏi
  async getAnswers(questionId) {
    const answersRef = db.collection('questions').doc(questionId).collection('answers');
    const snapshot = await answersRef.orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Cập nhật câu trả lời
  async updateAnswer(questionId, answerId, data) {
    await db.collection('questions').doc(questionId).collection('answers').doc(answerId).update(data);
    try {
      await db.collection('questions').doc(questionId).update({
        answerCount: require('../firebaseAdmin').admin.firestore.FieldValue.increment(1)
      });
    } catch (err) {
      console.error('Không thể tăng answerCount cho question:', questionId, err.message);
    }
    return { id: docRef.id };
  },

  // Xóa câu trả lời
  async deleteAnswer(questionId, answerId) {
    await db.collection('questions').doc(questionId).collection('answers').doc(answerId).delete();
    // Giảm answerCount của question đi 1
    try {
      await db.collection('questions').doc(questionId).update({
        answerCount: require('../firebaseAdmin').admin.firestore.FieldValue.increment(-1)
      });
    } catch (err) {
      console.error('Không thể giảm answerCount cho question:', questionId, err.message);
    }
    return { message: 'Đã xóa câu trả lời', answerId };
  },

  // Like (upvote) answer
  async likeAnswer(questionId, answerId) {
    const ref = db.collection('questions').doc(questionId).collection('answers').doc(answerId);
    await ref.update({ upvotes: require('../firebaseAdmin').admin.firestore.FieldValue.increment(1) });
    return { message: 'Đã like câu trả lời', answerId };
  },
  // Dislike (downvote) answer
  async dislikeAnswer(questionId, answerId) {
    const ref = db.collection('questions').doc(questionId).collection('answers').doc(answerId);
    await ref.update({ downvotes: require('../firebaseAdmin').admin.firestore.FieldValue.increment(1) });
    return { message: 'Đã dislike câu trả lời', answerId };
  }
};

module.exports = AnswerModel;
