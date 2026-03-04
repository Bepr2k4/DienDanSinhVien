const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/questionController');
const verifyFirebaseToken = require('../middlewares/authMiddleware');
const answerRouter = require('./answer');

// Lấy danh sách câu hỏi mới nhất
router.get('/',QuestionController.getLatestQuestions);

// Thêm câu hỏi mới
router.post('/', verifyFirebaseToken, QuestionController.addQuestion);

// Lấy chi tiết câu hỏi theo ID
router.get('/:id', QuestionController.getQuestionById);

// Xóa câu hỏi (chỉ admin hoặc chính chủ sở hữu mới được xóa)
router.delete('/:id', verifyFirebaseToken, QuestionController.deleteQuestion);

// Cập nhật câu hỏi (chỉ admin hoặc chính chủ sở hữu mới được sửa)
router.put('/:id', verifyFirebaseToken, QuestionController.updateQuestion);

// Gắn subroute cho answers
router.use('/:questionId/answers', answerRouter);

// Like (upvote) question
router.post('/:id/like', verifyFirebaseToken, QuestionController.likeQuestion);
// Dislike (downvote) question
router.post('/:id/dislike', verifyFirebaseToken, QuestionController.dislikeQuestion);

// Tìm kiếm câu hỏi theo title hoặc tag
router.get('/search', QuestionController.searchQuestions);

module.exports = router;
