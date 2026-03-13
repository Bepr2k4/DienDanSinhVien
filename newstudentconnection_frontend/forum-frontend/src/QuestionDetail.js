import * as React from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Typography, Paper, CircularProgress, Alert, Button, TextField, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

export default function QuestionDetail({ showSnackbar }) {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [errorAnswers, setErrorAnswers] = useState(null);
  const [showAddAnswer, setShowAddAnswer] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [addingAnswer, setAddingAnswer] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`http://localhost:8080/api/questions/${id}`)
      .then(res => {
        setQuestion(res.data);
        setLoading(false);
      })
      .catch((err) => {
        let msg = 'Không thể tải chi tiết câu hỏi';
        if (err.response && err.response.data && err.response.data.error) {
          msg += `: ${err.response.data.error}`;
        } else if (err.message) {
          msg += `: ${err.message}`;
        }
        setError(msg);
        setLoading(false);
      });
    setLoadingAnswers(true);
    setErrorAnswers(null);
    axios.get(`http://localhost:8080/api/questions/${id}/answers`)
      .then(res => {
        setAnswers(res.data);
        setLoadingAnswers(false);
      })
      .catch((err) => {
        let msg = 'Không thể tải câu trả lời';
        if (err.response && err.response.data && err.response.data.error) {
          msg += `: ${err.response.data.error}`;
        } else if (err.message) {
          msg += `: ${err.message}`;
        }
        setErrorAnswers(msg);
        setLoadingAnswers(false);
      });
  }, [id]);

  // Thêm hàm gửi answer
  const handleAddAnswer = async () => {
    if (!newAnswer.trim()) {
      if (typeof showSnackbar === 'function') showSnackbar('Vui lòng nhập nội dung trả lời!', 'error');
      return;
    }
    setAddingAnswer(true);
    const token = localStorage.getItem('token');
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    if (!token || !user) {
      if (typeof showSnackbar === 'function') showSnackbar('Bạn cần đăng nhập để trả lời!', 'error');
      setAddingAnswer(false);
      return;
    }
    // Gửi đủ thông tin cho backend
    const answerPayload = {
      content: newAnswer,
      userId: user.uid || user.id,
      userName: user.userName || user.name || user.email || 'Ẩn danh'
    };
    try {
      await axios.post(
        `http://localhost:8080/api/questions/${id}/answers`,
        answerPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAnswer('');
      setShowAddAnswer(false);
      // Reload answers
      const res = await axios.get(`http://localhost:8080/api/questions/${id}/answers`);
      setAnswers(res.data);
      if (typeof showSnackbar === 'function') showSnackbar('Đã thêm câu trả lời!', 'success');
    } catch (err) {
      let msg = 'Thêm câu trả lời thất bại!';
      if (err.response && err.response.data && err.response.data.error) {
        msg += `: ${err.response.data.error}`;
      } else if (err.message) {
        msg += `: ${err.message}`;
      }
      if (typeof showSnackbar === 'function') showSnackbar(msg, 'error');
    } finally {
      setAddingAnswer(false);
    }
  };

  // Thêm hàm xử lý like/dislike
  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (typeof showSnackbar === 'function') showSnackbar('Bạn cần đăng nhập để upvote!', 'error');
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/api/questions/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`http://localhost:8080/api/questions/${id}`);
      setQuestion(res.data);
      if (typeof showSnackbar === 'function') showSnackbar('Đã like!', 'success');
    } catch (err) {
      let msg = 'Like thất bại!';
      if (typeof showSnackbar === 'function') showSnackbar(msg, 'error');
    }
  };
  const handleDislike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (typeof showSnackbar === 'function') showSnackbar('Bạn cần đăng nhập để downvote!', 'error');
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/api/questions/${id}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`http://localhost:8080/api/questions/${id}`);
      setQuestion(res.data);
      if (typeof showSnackbar === 'function') showSnackbar('Đã dislike!', 'success');
    } catch (err) {
      let msg = 'Dislike thất bại!';
      if (typeof showSnackbar === 'function') showSnackbar(msg, 'error');
    }
  };

  // State cho edit/like/dislike từng answer
  const [editAnswerId, setEditAnswerId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loadingEditId, setLoadingEditId] = useState(null);
  const [loadingLikeId, setLoadingLikeId] = useState(null);
  const [loadingDislikeId, setLoadingDislikeId] = useState(null);

  if (loading) return <Container sx={{mt:4}}><CircularProgress /></Container>;
  if (error) return <Container sx={{mt:4}}><Alert severity="error">{error}</Alert></Container>;
  if (!question) return null;

  return (
    <Container maxWidth="md" sx={{mt:6}}>
      <Paper elevation={3} sx={{p:4}}>
        <Typography variant="h4" gutterBottom>{question.title}</Typography>
        <Typography color="text.secondary" sx={{mb:2}}>{question.content}</Typography>
        {/* Thông tin người đăng, upvote, downvote */}
        <Typography variant="subtitle2" color="text.secondary" sx={{mb:1}}>
          Người đăng: {question.userName || 'Ẩn danh'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{mb:2}}>
          Ngày đăng: {question.createdAt
            ? (question.createdAt._seconds
                ? new Date(question.createdAt._seconds * 1000).toLocaleString()
                : (question.createdAt.seconds
                    ? new Date(question.createdAt.seconds * 1000).toLocaleString()
                    : (Date.parse(question.createdAt)
                        ? new Date(question.createdAt).toLocaleString()
                        : String(question.createdAt)
                      )
                  )
              )
            : ''}
        </Typography>
        <Box sx={{display:'flex', alignItems:'center', gap:2, mb:2}}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<ThumbUpIcon />}
            onClick={handleLike}
          >
            {question.upvotes || 0}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ThumbDownIcon />}
            onClick={handleDislike}
          >
            {question.downvotes || 0}
          </Button>
        </Box>
        {/* Hiển thị danh sách câu trả lời */}
        {loadingAnswers ? (
          <CircularProgress sx={{mt:2}} />
        ) : errorAnswers ? (
          <Alert severity="error" sx={{mt:2}}>{errorAnswers}</Alert>
        ) : answers.length > 0 ? (
          <>
            <Typography variant="h6" sx={{mt:4, mb:2}}>Các câu trả lời:</Typography>
            {answers.map((ans, idx) => {
              const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
              const isOwner = user && (user.uid === ans.userId || user.id === ans.userId);
              const isAdmin = user && user.role === 'admin';
              // Like answer
              const handleLikeAnswer = async () => {
                const token = localStorage.getItem('token');
                if (!token) { showSnackbar && showSnackbar('Bạn cần đăng nhập để like!', 'error'); return; }
                setLoadingLikeId(ans.id || ans._id);
                try {
                  await axios.post(`http://localhost:8080/api/questions/${id}/answers/${ans.id || ans._id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
                  const res = await axios.get(`http://localhost:8080/api/questions/${id}/answers`);
                  setAnswers(res.data);
                  showSnackbar && showSnackbar('Đã like câu trả lời!', 'success');
                } catch (err) { showSnackbar && showSnackbar('Like thất bại!', 'error'); }
                setLoadingLikeId(null);
              };
              // Dislike answer
              const handleDislikeAnswer = async () => {
                const token = localStorage.getItem('token');
                if (!token) { showSnackbar && showSnackbar('Bạn cần đăng nhập để dislike!', 'error'); return; }
                setLoadingDislikeId(ans.id || ans._id);
                try {
                  await axios.post(`http://localhost:8080/api/questions/${id}/answers/${ans.id || ans._id}/dislike`, {}, { headers: { Authorization: `Bearer ${token}` } });
                  const res = await axios.get(`http://localhost:8080/api/questions/${id}/answers`);
                  setAnswers(res.data);
                  showSnackbar && showSnackbar('Đã dislike câu trả lời!', 'success');
                } catch (err) { showSnackbar && showSnackbar('Dislike thất bại!', 'error'); }
                setLoadingDislikeId(null);
              };
              // Edit answer
              const handleEditAnswer = async () => {
                if (!editContent.trim()) return;
                setLoadingEditId(ans.id || ans._id);
                const token = localStorage.getItem('token');
                try {
                  await axios.put(`http://localhost:8080/api/questions/${id}/answers/${ans.id || ans._id}`, { content: editContent }, { headers: { Authorization: `Bearer ${token}` } });
                  const res = await axios.get(`http://localhost:8080/api/questions/${id}/answers`);
                  setAnswers(res.data);
                  setEditAnswerId(null);
                  showSnackbar && showSnackbar('Đã sửa câu trả lời!', 'success');
                } catch (err) { showSnackbar && showSnackbar('Sửa thất bại!', 'error'); }
                setLoadingEditId(null);
              };
              // Delete answer
              const handleDeleteAnswer = async () => {
                if (!window.confirm('Bạn có chắc chắn muốn xóa câu trả lời này?')) return;
                const token = localStorage.getItem('token');
                try {
                  await axios.delete(`http://localhost:8080/api/questions/${id}/answers/${ans.id || ans._id}`, { headers: { Authorization: `Bearer ${token}` } });
                  const res = await axios.get(`http://localhost:8080/api/questions/${id}/answers`);
                  setAnswers(res.data);
                  showSnackbar && showSnackbar('Đã xóa câu trả lời!', 'success');
                } catch (err) { showSnackbar && showSnackbar('Xóa thất bại!', 'error'); }
              };
              return (
                <Paper key={ans.id || ans._id || idx} elevation={1} sx={{p:2, mb:2, position:'relative'}}>
                  {editAnswerId === (ans.id || ans._id) ? (
                    <Box sx={{display:'flex', flexDirection:'column', gap:1}}>
                      <TextField value={editContent} onChange={e=>setEditContent(e.target.value)} multiline minRows={2} fullWidth />
                      <Box sx={{display:'flex', gap:1, mt:1}}>
                        <Button variant="contained" color="success" size="small" onClick={handleEditAnswer} disabled={loadingEditId === (ans.id || ans._id)}>{loadingEditId === (ans.id || ans._id) ? 'Đang lưu...' : 'Lưu'}</Button>
                        <Button variant="outlined" color="secondary" size="small" onClick={()=>setEditAnswerId(null)}>Hủy</Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Typography>{ans.content}</Typography>
                      {ans.userName && (
                        <Typography variant="caption" color="text.secondary">Bởi: {ans.userName}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ml:1}}>
                        Ngày đăng: {ans.createdAt
                          ? (ans.createdAt._seconds
                              ? new Date(ans.createdAt._seconds * 1000).toLocaleString()
                              : (ans.createdAt.seconds
                                  ? new Date(ans.createdAt.seconds * 1000).toLocaleString()
                                  : (Date.parse(ans.createdAt)
                                      ? new Date(ans.createdAt).toLocaleString()
                                      : String(ans.createdAt)
                                    )
                                )
                            )
                          : ''}
                      </Typography>
                      <Box sx={{display:'flex', alignItems:'center', gap:1, mt:1}}>
                        <Button size="small" color="success" startIcon={<ThumbUpIcon />} onClick={handleLikeAnswer} disabled={loadingLikeId === (ans.id || ans._id)}>
                          {ans.upvotes || 0}
                        </Button>
                        <Button size="small" color="error" startIcon={<ThumbDownIcon />} onClick={handleDislikeAnswer} disabled={loadingDislikeId === (ans.id || ans._id)}>
                          {ans.downvotes || 0}
                        </Button>
                        {(isOwner || isAdmin) && (
                          <>
                            {isOwner && (
                              <Button size="small" color="primary" onClick={()=>{setEditAnswerId(ans.id || ans._id);setEditContent(ans.content);}}>Sửa</Button>
                            )}
                            <Button size="small" color="error" onClick={handleDeleteAnswer}>Xóa</Button>
                          </>
                        )}
                      </Box>
                    </>
                  )}
                </Paper>
              );
            })}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{mt:2}}
              onClick={() => setShowAddAnswer(true)}
            >
              Thêm câu trả lời
            </Button>
            {showAddAnswer && (
              <Box sx={{mt:2}}>
                <TextField
                  label="Nội dung câu trả lời"
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{mb:1}}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAddAnswer}
                  disabled={addingAnswer}
                >
                  {addingAnswer ? 'Đang gửi...' : 'Gửi câu trả lời'}
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => setShowAddAnswer(false)}
                  sx={{ml:1}}
                >
                  Hủy
                </Button>
              </Box>
            )}
          </>
        ) : (
          <>
            <Typography color="text.secondary" sx={{mt:4}}>Chưa có câu trả lời nào.</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{mt:2}}
              onClick={() => setShowAddAnswer(true)}
            >
              Thêm câu trả lời
            </Button>
            {showAddAnswer && (
              <Box sx={{mt:2}}>
                <TextField
                  label="Nội dung câu trả lời"
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{mb:1}}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAddAnswer}
                  disabled={addingAnswer}
                >
                  {addingAnswer ? 'Đang gửi...' : 'Gửi câu trả lời'}
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => setShowAddAnswer(false)}
                  sx={{ml:1}}
                >
                  Hủy
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}
