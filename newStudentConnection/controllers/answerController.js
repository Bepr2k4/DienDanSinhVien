const AnswerModel = require('../models/answerModel');
const admin = require('firebase-admin');

const AnswerController = {
  // Thêm câu trả lời mới cho một câu hỏi
  async addAnswer(req, res) {
    try {
      const { questionId } = req.params;
      const { content, userId, userName } = req.body;
      if (!content || !userId || !userName) {
        return res.status(400).json({ error: 'Thiếu thông tin câu trả lời.' });
      }
      const result = await AnswerModel.addAnswer(questionId, { content, userId, userName });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy danh sách câu trả lời của một câu hỏi
  async getAnswers(req, res) {
    try {
      const { questionId } = req.params;
      const answers = await AnswerModel.getAnswers(questionId);
      res.json(answers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Cập nhật câu trả lời
  async updateAnswer(req, res) {
    try {
      const { questionId, answerId } = req.params;
      const data = req.body;
      const user = req.user;
      // Lấy answer hiện tại
      const answers = await AnswerModel.getAnswers(questionId);
      const answer = answers.find(a => a.id === answerId);
      if (!answer) {
        return res.status(404).json({ error: 'Câu trả lời không tồn tại.' });
      }
      if (user.role !== 'admin' && user.uid !== answer.userId) {
        return res.status(403).json({ error: 'Bạn không có quyền sửa câu trả lời này.' });
      }
      const result = await AnswerModel.updateAnswer(questionId, answerId, data);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Xóa câu trả lời
  async deleteAnswer(req, res) {
    try {
      const { questionId, answerId } = req.params;
      const user = req.user;
      // Lấy answer hiện tại
      const answers = await AnswerModel.getAnswers(questionId);
      const answer = answers.find(a => a.id === answerId);
      if (!answer) {
        return res.status(404).json({ error: 'Câu trả lời không tồn tại.' });
      }
      if (user.role !== 'admin' && user.uid !== answer.userId) {
        return res.status(403).json({ error: 'Bạn không có quyền xóa câu trả lời này.' });
      }
      const result = await AnswerModel.deleteAnswer(questionId, answerId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Like (upvote) answer
  async likeAnswer(req, res) {
    try {
      const { questionId, answerId } = req.params;
      const result = await AnswerModel.likeAnswer(questionId, answerId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Dislike (downvote) answer
  async dislikeAnswer(req, res) {
    try {
      const { questionId, answerId } = req.params;
      const result = await AnswerModel.dislikeAnswer(questionId, answerId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = AnswerController;
