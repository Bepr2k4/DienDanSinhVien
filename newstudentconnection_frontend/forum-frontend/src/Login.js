import axios from 'axios';
import { useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Box, Alert } from '@mui/material';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import app from './firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const auth = getAuth();
      // Đăng nhập với Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      // Gửi idToken lên backend
      const res = await axios.post('http://localhost:8080/api/auth/login', {}, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setSuccess(true);
      // Lưu thông tin user và token vào localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', idToken);
      // Chuyển hướng sang trang danh sách câu hỏi
      setTimeout(() => navigate('/questions'), 1000);
    } catch (err) {
      let msg = 'Đăng nhập thất bại!';
      setError(msg);
    }
  };

  return (
    <Container maxWidth="sm" sx={{mt:6}}>
      <Paper elevation={3} sx={{p:4}}>
        <Typography variant="h4" gutterBottom>Đăng nhập</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Đăng nhập thành công!</Alert>}
        <Box component="form" sx={{display:'flex', flexDirection:'column', gap:2}} onSubmit={handleSubmit}>
          <TextField label="Email" type="email" required fullWidth value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Mật khẩu" type="password" required fullWidth value={password} onChange={e => setPassword(e.target.value)} />
          <Button variant="contained" color="primary" sx={{mt:2}} type="submit">Đăng nhập</Button>
        </Box>
      </Paper>
    </Container>
  );
}
