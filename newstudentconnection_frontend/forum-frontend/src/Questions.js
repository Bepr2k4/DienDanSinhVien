import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, List, CircularProgress, Alert, Paper, Box, Button, TextField, Tabs, Tab, Chip, Stack, Fade } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ListItem, ListItemSecondaryAction, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Questions({ showSnackbar }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [allTags, setAllTags] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/api/questions')
      .then(res => {
        setQuestions(res.data);
        const tags = Array.from(new Set(res.data.flatMap(q => q.tags || [])));
        setAllTags(tags);
        setLoading(false);
      })
      .catch(err => {
        let msg = 'Không thể tải danh sách câu hỏi';
        if (err.response && err.response.data && err.response.data.error) {
          msg += `: ${err.response.data.error}`;
        } else if (err.message) {
          msg += `: ${err.message}`;
        }
        setError(msg);
        setLoading(false);
      });
  }, []);

  // Debounce search: chỉ gọi API khi user dừng nhập 400ms
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      axios.get('http://localhost:8080/api/questions', {
        params: search ? { search } : undefined
      })
        .then(res => {
          setQuestions(res.data);
          const tags = Array.from(new Set(
            res.data.flatMap(q => Array.isArray(q.tags) ? q.tags : (typeof q.tags === 'string' && q.tags ? q.tags.split(',').map(t => t.trim()) : []))
          ));
          setAllTags(tags);
          setLoading(false);
        })
        .catch(err => {
          let msg = 'Không thể tải danh sách câu hỏi';
          setError(msg);
          setLoading(false);
        });
    }, 1000);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Hàm xóa câu hỏi
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(qs => qs.filter(q => (q.id || q._id) !== id));
      showSnackbar && showSnackbar('Đã xóa câu hỏi!', 'success');
    } catch (err) {
      showSnackbar && showSnackbar('Xóa câu hỏi thất bại!', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Lọc câu hỏi theo search và tab
  const filteredQuestions = questions.filter(q => {
    const matchTitle = q.title.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || (q.tags && q.tags.includes(tab));
    return matchTitle && matchTab;
  });

  if (loading) return <Container sx={{mt:4}}><CircularProgress /></Container>;
  if (error) return <Container sx={{mt:4}}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="md" sx={{mt:4}}>
      <Paper elevation={4} sx={{p:4, background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)'}}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb:3}}>
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>Khám phá câu hỏi</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/questions/new')}
            sx={{fontWeight:600}}
          >
            Thêm câu hỏi
          </Button>
        </Box>
        <Stack direction={{xs:'column',sm:'row'}} spacing={2} alignItems="center" sx={{mb:3}}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon color="primary" sx={{mr:1}} /> }}
            sx={{flex:1, minWidth:220, background:'#fff'}}
          />
          <Tabs
            value={tab}
            onChange={(_,v)=>setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{flex:2, minHeight:40}}
          >
            <Tab label="Tất cả" value="all" />
            {allTags.map(t => <Tab key={t} label={t} value={t} />)}
          </Tabs>
        </Stack>
        <List sx={{mt:2}}>
          {filteredQuestions.length === 0 && (
            <Typography color="text.secondary" sx={{textAlign:'center', mt:3}}>Không tìm thấy câu hỏi phù hợp.</Typography>
          )}
          {filteredQuestions.map((q, idx) => (
            <Fade in timeout={400+idx*80} key={q.id||q._id}>
              <Paper elevation={6} sx={{
                mb:3,
                borderLeft: '6px solid #1976d2',
                background: 'linear-gradient(90deg, #fff, #e3f2fd 80%)',
                boxShadow: '0 4px 24px 0 rgba(25,118,210,0.08)',
                transition: 'transform 0.2s',
                '&:hover': {transform:'scale(1.025)', boxShadow:'0 8px 32px 0 #1976d233'}
              }}>
                <ListItem button component={Link} to={`/questions/${q.id || q._id}`} alignItems="flex-start" sx={{p:3, display:'flex', alignItems:'flex-start', position:'relative'}}>
                  <Box sx={{flex:1, minWidth:0}}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{mb:1}}>
                      <Typography variant="h6" fontWeight={700} color="primary.main" noWrap>{q.title}</Typography>
                      {q.upvotes > 10 && <StarIcon color="warning" fontSize="small" titleAccess="Câu hỏi nổi bật"/>}
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{mb:1, flexWrap:'wrap'}}>
                      {Array.isArray(q.tags)
                        ? q.tags.map(tag => <Chip key={tag} label={tag} size="small" color="info" />)
                        : (typeof q.tags === 'string' && q.tags)
                          ? q.tags.split(',').map(tag => <Chip key={tag.trim()} label={tag.trim()} size="small" color="info" />)
                          : null
                      }
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Ngày đăng: {q.createdAt
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
                    <Stack direction={{xs:'column',sm:'row'}} spacing={2} alignItems="flex-start">
                      <Typography variant="body2" color="text.secondary">Người đăng: {q.userName || 'Ẩn danh'}</Typography>
                      <Typography variant="body2" color="text.secondary">Upvote: {q.upvotes || 0} | Downvote: {q.downvotes || 0}</Typography>
                      <Typography variant="body2" color="primary.main">Số câu trả lời: {q.answerCount ?? 0}</Typography>
                    </Stack>
                  </Box>
                  <ListItemSecondaryAction sx={{right:0, top:24, display:'flex', alignItems:'center', gap:1}}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton edge="end" aria-label="upvote" disabled>
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="success.main">{q.upvotes || 0}</Typography>
                      <IconButton edge="end" aria-label="downvote" disabled>
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="error.main">{q.downvotes || 0}</Typography>
                      {/* Nút Sửa/Xóa chỉ hiển thị nếu là chủ sở hữu (Firebase UID) */}
                      {user && (user.uid === q.userId) && (
                        <IconButton edge="end" color="primary" aria-label="edit" onClick={e => {
                          e.preventDefault();
                          navigate(`/questions/${q.id || q._id}/edit`);
                        }}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {user && ((user.uid === q.userId) || user.role === 'admin') && (
                        <IconButton edge="end" color="error" aria-label="delete" onClick={e => {e.preventDefault(); handleDelete(q.id || q._id);}} disabled={deletingId === (q.id || q._id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            </Fade>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
