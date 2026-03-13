import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Stack, Chip, CircularProgress } from '@mui/material';

export default function UserProfile({ showSnackbar }) {
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    Promise.all([
      axios.get(`http://localhost:8080/api/users/${uid}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`http://localhost:8080/api/questions?userId=${uid}`)
    ])
      .then(([userRes, qsRes]) => {
        setUser(userRes.data);
        setQuestions(qsRes.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        showSnackbar && showSnackbar('Không thể tải thông tin người dùng!', 'error');
      });
  }, [uid]);

  // Đảm bảo chỉ hiển thị câu hỏi đúng userId
  const filteredQuestions = questions.filter(q => (q.userId === uid));

  if (loading) return <Container sx={{mt:4}}><CircularProgress /></Container>;
  if (!user) return <Container sx={{mt:4}}><Typography>Không tìm thấy người dùng.</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{mt:6}}>
      <Paper elevation={3} sx={{p:4}}>
        <Typography variant="h4" gutterBottom>Thông tin người dùng</Typography>
        <Typography variant="h6">{user.userName || user.name || 'Ẩn danh'}</Typography>
        <Typography color="text.secondary">Email: {user.email}</Typography>
        <Typography color="text.secondary">
          Ngày tạo tài khoản: {user.createdAt
            ? (user.createdAt._seconds
                ? new Date(user.createdAt._seconds * 1000).toLocaleString()
                : (user.createdAt.seconds
                    ? new Date(user.createdAt.seconds * 1000).toLocaleString()
                    : (Date.parse(user.createdAt)
                        ? new Date(user.createdAt).toLocaleString()
                        : String(user.createdAt)
                      )
                  )
              )
            : 'Không rõ'}
        </Typography>
        <Box sx={{mt:3}}>
          <Typography variant="h6" sx={{mb:2}}>Các câu hỏi đã đăng:</Typography>
          {filteredQuestions.length === 0 ? (
            <Typography color="text.secondary">Chưa có câu hỏi nào.</Typography>
          ) : (
            <Stack spacing={2}>
              {filteredQuestions.map(q => (
                <Paper key={q.id || q._id} elevation={1} sx={{p:2}}>
                  <Typography variant="subtitle1" fontWeight={600}>{q.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ml:1}}>
                    {q.createdAt
                      ? (q.createdAt._seconds
                          ? new Date(q.createdAt._seconds * 1000).toLocaleString()
                          : (q.createdAt.seconds
                              ? new Date(q.createdAt.seconds * 1000).toLocaleString()
                              : (Date.parse(q.createdAt)
                                  ? new Date(q.createdAt).toLocaleString()
                                  : String(q.createdAt)
                                )
                            )
                        )
                      : ''}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{mb:1, mt:1}}>
                    {Array.isArray(q.tags)
                      ? q.tags.map(tag => <Chip key={tag} label={tag} size="small" color="info" />)
                      : (typeof q.tags === 'string' && q.tags)
                        ? q.tags.split(',').map(tag => <Chip key={tag.trim()} label={tag.trim()} size="small" color="info" />)
                        : null
                    }
                  </Stack>
                  <Typography variant="body2" color="text.secondary">Upvote: {q.upvotes || 0} | Downvote: {q.downvotes || 0}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
