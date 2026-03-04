// routes/answer.js - Router cho API câu trả lời (answers)
const express = require('express');
const router = express.Router({ mergeParams: true });
const AnswerController = require('../controllers/answerController');
const verifyFirebaseToken = require('../middlewares/authMiddleware');

// Lấy danh sách câu trả lời của một câu hỏi
router.get('/', AnswerController.getAnswers);

// Thêm câu trả lời mới cho một câu hỏi
router.post('/', verifyFirebaseToken, AnswerController.addAnswer);

// Cập nhật câu trả lời (chỉ admin hoặc chính chủ sở hữu mới được sửa)
router.put('/:answerId', verifyFirebaseToken, AnswerController.updateAnswer);

// Xóa câu trả lời (chỉ admin hoặc chính chủ sở hữu mới được xóa)
router.delete('/:answerId', verifyFirebaseToken, AnswerController.deleteAnswer);

// Like (upvote) answer
router.post('/:answerId/like', verifyFirebaseToken, AnswerController.likeAnswer);
// Dislike (downvote) answer
router.post('/:answerId/dislike', verifyFirebaseToken, AnswerController.dislikeAnswer);

module.exports = router;
