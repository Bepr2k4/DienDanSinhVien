import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Autocomplete } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NewQuestion({ showSnackbar }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy danh sách câu hỏi để tổng hợp tag
    axios.get('http://localhost:8080/api/questions')
      .then(res => {
        const tags = Array.from(new Set(res.data.flatMap(q => q.tags || [])));
        setAllTags(tags);
      })
      .catch(() => setAllTags([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tags.length || tags.filter(t => t !== '__SEE_MORE__').length === 0) {
      showSnackbar && showSnackbar('Vui lòng chọn ít nhất 1 tag!', 'error');
      return;
    }
    setLoading(true);
    const cleanTags = tags.filter(t => t !== '__SEE_MORE__');
    const tagsString = cleanTags.join(', ');
    // Lấy user từ localStorage
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {}
    const userId = user?.uid || user?.id || user?._id || '';
    const userName = user?.userName || user?.name || user?.email || '';
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/questions', {
        title,
        content,
        tags: tagsString,
        userId,
        userName
      }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      showSnackbar && showSnackbar('Đã thêm câu hỏi mới!', 'success');
      navigate('/questions');
    } catch (err) {
      showSnackbar && showSnackbar(err, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{mt:6, mb:6}}>
      <Paper elevation={6} sx={{
        p: { xs: 2, sm: 4 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
        boxShadow: '0 8px 32px 0 #1976d233',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: -32,
          right: -32,
          width: 120,
          height: 120,
          background: 'radial-gradient(circle, #1976d2 0%, #e3f2fd 80%)',
          opacity: 0.12,
          borderRadius: '50%'
        }} />
        <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
          <span style={{letterSpacing:1}}>📝 Thêm câu hỏi mới</span>
        </Typography>
        <Typography align="center" color="text.secondary" sx={{mb:3}}>
          Đặt câu hỏi của bạn để nhận được sự hỗ trợ từ cộng đồng sinh viên!
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{
          display:'flex', flexDirection:'column', gap:3, background:'#fff', borderRadius:3, p:{xs:2,sm:3}, boxShadow:'0 2px 8px #1976d211'
        }}>
          <TextField label="Tiêu đề câu hỏi" value={title} onChange={e => setTitle(e.target.value)} required fullWidth
            variant="outlined" InputProps={{style:{fontWeight:600}}} sx={{bgcolor:'#f8fafc'}} />
          <TextField label="Nội dung chi tiết" value={content} onChange={e => setContent(e.target.value)} required fullWidth multiline minRows={5}
            variant="outlined" sx={{bgcolor:'#f8fafc'}} />
          <Autocomplete
            multiple
            freeSolo
            options={showAllTags ? allTags : allTags.slice(0,7).concat(allTags.length > 7 ? ['__SEE_MORE__'] : [])}
            value={tags}
            onChange={(e, value) => {
              if (value.includes('__SEE_MORE__')) {
                setShowAllTags(true);
                setTags(tags);
              } else {
                setTags(value);
              }
            }}
            renderOption={(props, option) =>
              option === '__SEE_MORE__' ? (
                <li {...props} style={{fontStyle:'italic', color:'#1976d2', fontWeight:600}}>
                  ... Xem thêm tag
                </li>
              ) : (
                <li {...props}>{option}</li>
              )
            }
            renderInput={(params) => <TextField {...params} label="Chọn hoặc nhập tag (tối đa 5)" />}
            sx={{background:'#f8fafc'}}
            limitTags={5}
          />
          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading}
            sx={{fontWeight:700, fontSize:18, py:1.5, borderRadius:2, boxShadow:'0 4px 16px #1976d233'}}>
            {loading ? 'Đang gửi...' : '🚀 Thêm câu hỏi'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
