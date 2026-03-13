import * as React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Box, Alert } from '@mui/material';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    // Kiểm tra hợp lệ trước khi gửi backend
    if (!email) {
      setError('Vui lòng nhập email!');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu!');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }
    if (!userName) {
      setError('Vui lòng nhập tên người dùng!');
      return;
    }
    try {
      // Gửi trực tiếp thông tin đăng ký lên backend
      await axios.post('http://localhost:8080/api/auth/register', {
        email,
        password,
        userName
      });
      setSuccess(true);
    } catch (err) {
      let msg = 'Đăng ký thất bại!';
      if (err.response && err.response.data && err.response.data.error) {
        msg += ` (Backend: ${err.response.data.error})`;
      } else if (err.message) {
        msg += ` (${err.message})`;
      }
      setError(msg);
    }
  };

  return (
    <Container maxWidth="sm" sx={{mt:6}}>
      <Paper elevation={3} sx={{p:4}}>
        <Typography variant="h4" gutterBottom>Đăng ký tài khoản</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Đăng ký thành công!</Alert>}
        <Box component="form" sx={{display:'flex', flexDirection:'column', gap:2}} onSubmit={handleSubmit}>
          <TextField label="Email" type="email" required fullWidth value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Mật khẩu" type="password" required fullWidth value={password} onChange={e => setPassword(e.target.value)} />
          <TextField label="Nhập lại mật khẩu" type="password" required fullWidth value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          <TextField label="Tên người dùng" required fullWidth value={userName} onChange={e => setUserName(e.target.value)} />
          <Button variant="contained" color="primary" sx={{mt:2}} type="submit">Đăng ký</Button>
        </Box>
      </Paper>
    </Container>
  );
}
