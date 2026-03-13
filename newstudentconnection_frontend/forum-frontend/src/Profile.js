import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Paper, Box, Avatar } from '@mui/material';

export default function Profile({ showSnackbar }) {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const [name, setName] = useState(user?.userName || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:8080/api/users/${user.uid || user.id}`,
        { userName: name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('user', JSON.stringify({ ...user, userName: name, email }));
      showSnackbar && showSnackbar('Cập nhật thông tin thành công!', 'success');
    } catch (err) {
      showSnackbar && showSnackbar('Cập nhật thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Container sx={{mt:4}}><Typography>Bạn cần đăng nhập để chỉnh sửa thông tin cá nhân.</Typography></Container>;

  return (
    <Container maxWidth="sm" sx={{mt:6}}>
      <Paper elevation={3} sx={{p:4}}>
        <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', mb:2}}>
          <Avatar sx={{width:64, height:64, mb:2}}>{(name||'U')[0]}</Avatar>
          <Typography variant="h5" gutterBottom>Chỉnh sửa thông tin cá nhân</Typography>
        </Box>
        <TextField label="Tên hiển thị" value={name} onChange={e=>setName(e.target.value)} fullWidth sx={{mb:2}} />
        <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth sx={{mb:2}} disabled />
        <Button variant="contained" color="primary" onClick={handleSave} disabled={loading} fullWidth>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </Paper>
    </Container>
  );
}
