import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Autocomplete } from '@mui/material';
import axios from 'axios';

export default function EditQuestion({ showSnackbar }) {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy chi tiết câu hỏi
    axios.get(`http://localhost:8080/api/questions/${id}`)
      .then(res => {
        setTitle(res.data.title || '');
        setContent(res.data.content || '');
        setTags(res.data.tags ? (Array.isArray(res.data.tags) ? res.data.tags : res.data.tags.split(',').map(t => t.trim())) : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải chi tiết câu hỏi');
        setLoading(false);
      });
    // Lấy all tags
    axios.get('http://localhost:8080/api/questions')
      .then(res => {
        const tags = Array.from(new Set(res.data.flatMap(q => q.tags || [])));
        setAllTags(tags);
      })
      .catch(() => setAllTags([]));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const cleanTags = tags.filter(t => t !== '__SEE_MORE__');
    const tagsString = cleanTags.join(', ');
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:8080/api/questions/${id}`, {
        title,
        content,
        tags: tagsString
      }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      showSnackbar && showSnackbar('Đã cập nhật câu hỏi!', 'success');
      navigate(`/questions/${id}`);
    } catch (err) {
      showSnackbar && showSnackbar('Cập nhật thất bại!', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container sx={{mt:4}}><CircularProgress /></Container>;
  if (error) return <Container sx={{mt:4}}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="sm" sx={{mt:6, mb:6}}>
      <Paper elevation={6} sx={{p:4, borderRadius:4, background:'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)', boxShadow:'0 8px 32px 0 #1976d233'}}>
        <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
          ✏️ Sửa câu hỏi
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{display:'flex', flexDirection:'column', gap:3, background:'#fff', borderRadius:3, p:{xs:2,sm:3}, boxShadow:'0 2px 8px #1976d211', alignItems:'center'}}>
          <TextField label="Tiêu đề câu hỏi" value={title} onChange={e => setTitle(e.target.value)} required fullWidth variant="outlined" InputProps={{style:{fontWeight:600, fontSize:18}}} sx={{bgcolor:'#f8fafc', maxWidth:500}} />
          <TextField label="Nội dung chi tiết" value={content} onChange={e => setContent(e.target.value)} required fullWidth multiline minRows={6} variant="outlined" sx={{bgcolor:'#f8fafc', maxWidth:500}} />
          <Autocomplete
            multiple
            freeSolo
            options={allTags.slice(0,7).concat(allTags.length > 7 ? ['__SEE_MORE__'] : [])}
            value={tags}
            onChange={(e, value) => {
              if (value.includes('__SEE_MORE__')) return;
              setTags(value);
            }}
            renderInput={(params) => <TextField {...params} label="Chọn hoặc nhập tag (tối đa 5)" sx={{maxWidth:500}} />}
            sx={{background:'#f8fafc', maxWidth:500}}
            limitTags={5}
          />
          <Button type="submit" variant="contained" color="primary" size="large" disabled={saving} sx={{fontWeight:700, fontSize:18, py:1.5, borderRadius:2, boxShadow:'0 4px 16px #1976d233', maxWidth:300, mt:2}}>
            {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
