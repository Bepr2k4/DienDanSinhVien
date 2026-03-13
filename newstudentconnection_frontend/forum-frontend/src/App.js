import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Questions from './Questions';
import QuestionDetail from './QuestionDetail';
import NewQuestion from './NewQuestion';
import EditQuestion from './EditQuestion';
import Profile from './Profile';
import UserProfile from './UserProfile';
import './App.css';
import { AppBar, Toolbar, Typography, Box, Snackbar, Alert, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function App() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hàm dùng để hiển thị snackbar từ các component con (có thể truyền qua context hoặc props nếu muốn mở rộng)
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Giả lập user, bạn có thể lấy từ localStorage hoặc context thực tế
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  // Lắng nghe sự thay đổi của localStorage (khi login/logout)
  React.useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user')));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', syncUser);
    // Thêm lắng nghe khi tab được kích hoạt lại (reload hoặc chuyển trang)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        syncUser();
      }
    });
    return () => {
      window.removeEventListener('storage', syncUser);
      document.removeEventListener('visibilitychange', syncUser);
    };
  }, []);

  // Cập nhật user khi đăng nhập thành công (khi showSnackbar được gọi từ Login)
  React.useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, [snackbar]);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setSnackbar({ open: true, message: 'Đã đăng xuất!', severity: 'info' });
    // Điều hướng về Home hoặc reload nếu đang ở Home
    setTimeout(() => {
      if (window.location.pathname === '/') {
        window.location.reload();
      } else {
        window.location.href = '/';
      }
    }, 300);
  };

  const menuItems = [
    { text: 'Trang chủ', to: '/' },
    { text: 'Câu hỏi', to: '/questions' },
    // Nếu đã login thì hiện thêm Thông tin cá nhân và Chỉnh sửa thông tin
    ...(!user ? [
      { text: 'Đăng nhập', to: '/login' },
      { text: 'Đăng ký', to: '/register' }
    ] : [
      { text: 'Thông tin cá nhân', to: `/users/${user.uid || user.id}` },
      { text: 'Chỉnh sửa thông tin', to: '/profile' },
      { text: 'Đăng xuất', action: handleLogout }
    ])
  ];

  // Khi Drawer mở ra, luôn cập nhật lại user từ localStorage để đảm bảo trạng thái đăng nhập sidebar luôn đúng
  const handleDrawerOpen = () => {
    try {
      setUser(JSON.parse(localStorage.getItem('user')));
    } catch {
      setUser(null);
    }
    setDrawerOpen(true);
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleDrawerOpen}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            Diễn đàn SV
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          {/* Thông tin user */}
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <AccountCircleIcon fontSize="large" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="subtitle1">
                {user?.userName || 'Khách'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'Chưa đăng nhập'}
              </Typography>
            </Box>
          </Box>
          <List>
            {menuItems.map((item) => (
              item.action ? (
                <ListItem button key={item.text} onClick={item.action}>
                  <ListItemText primary={item.text} />
                </ListItem>
              ) : (
                <ListItem button component={Link} to={item.to} key={item.text}>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            ))}
          </List>
        </Box>
      </Drawer>
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<Home showSnackbar={showSnackbar} />} />
          <Route path="/login" element={<Login showSnackbar={showSnackbar} />} />
          <Route path="/register" element={<Register showSnackbar={showSnackbar} />} />
          <Route path="/questions" element={<Questions showSnackbar={showSnackbar} />} />
          <Route path="/questions/new" element={<NewQuestion showSnackbar={showSnackbar} />} />
          <Route path="/questions/:id" element={<QuestionDetail showSnackbar={showSnackbar} />} />
          <Route path="/questions/:id/edit" element={<EditQuestion showSnackbar={showSnackbar} />} />
          <Route path="/profile" element={<Profile showSnackbar={showSnackbar} />} />
          <Route path="/users/:uid" element={<UserProfile showSnackbar={showSnackbar} />} />
        </Routes>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Router>
  );
}

export default App;
