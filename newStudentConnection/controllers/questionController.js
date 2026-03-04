const QuestionModel = require('../models/questionModel');
const admin = require('firebase-admin');

const QuestionController = {
  async getLatestQuestions(req, res) {
    try {
      const questions = await QuestionModel.getLatestQuestions();
      res.json(questions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async addQuestion(req, res) {
    try {
      const { title, content, tags, userId, userName, other } = req.body;
      const result = await QuestionModel.addQuestion({ title, content, tags, userId, userName, other });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getQuestionById(req, res) {
    try {
      const question = await QuestionModel.getQuestionById(req.params.id);
      res.json(question);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const user = req.user; // Lấy thông tin user từ middleware xác thực
      const question = await QuestionModel.getQuestionById(id);
      // Kiểm tra quyền xóa: admin hoặc chính chủ sở hữu câu hỏi
      if (user.role !== 'admin' && user.uid !== question.userId) {
        return res.status(403).json({ error: 'Bạn không có quyền xóa câu hỏi này.' });
      }
      await QuestionModel.deleteQuestion(id);
      res.json({ message: 'Đã xóa câu hỏi.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Cập nhật thông tin câu hỏi
  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Chỉ cho phép admin hoặc chính chủ sở hữu câu hỏi cập nhật
      const user = req.user;
      const question = await QuestionModel.getQuestionById(id);
      if (user.role !== 'admin' && user.uid !== question.userId) {
        return res.status(403).json({ error: 'Bạn không có quyền sửa câu hỏi này.' });
      }
      const result = await QuestionModel.updateQuestion(id, data);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Like (upvote) question
  async likeQuestion(req, res) {
    try {
      const { id } = req.params;
      const result = await QuestionModel.likeQuestion(id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Dislike (downvote) question
  async dislikeQuestion(req, res) {
    try {
      const { id } = req.params;
      const result = await QuestionModel.dislikeQuestion(id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Tìm kiếm câu hỏi theo title hoặc tag
  async searchQuestions(req, res) {
    try {
      const { q, tag, limit } = req.query;
      const questions = await QuestionModel.searchQuestions({ q, tag, limitNumber: limit ? parseInt(limit) : 20 });
      res.json(questions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = QuestionController;
