import * as React from 'react';
import { Container, Typography, Box, Button, Paper, Grid, Avatar, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import ForumIcon from '@mui/icons-material/Forum';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';

export default function Home() {
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);

  const highlights = [
    {
      icon: <QuestionAnswerIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Hỏi đáp mọi chủ đề',
      desc: 'Đặt câu hỏi, nhận câu trả lời nhanh chóng từ cộng đồng sinh viên.'
    },
    {
      icon: <GroupsIcon color="success" sx={{ fontSize: 40 }} />,
      title: 'Kết nối bạn bè',
      desc: 'Tìm kiếm, kết nối và học hỏi cùng các sinh viên khác trên toàn quốc.'
    },
    {
      icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 40 }} />,
      title: 'Tích điểm & vinh danh',
      desc: 'Tham gia trả lời, tích điểm, nhận huy hiệu và được vinh danh trên bảng xếp hạng.'
    },
    {
      icon: <StarIcon color="secondary" sx={{ fontSize: 40 }} />,
      title: 'Giao diện hiện đại',
      desc: 'Trải nghiệm mượt mà, tối ưu cho cả máy tính và điện thoại.'
    },
    {
      icon: <SecurityIcon color="info" sx={{ fontSize: 40 }} />,
      title: 'Bảo mật & riêng tư',
      desc: 'Thông tin cá nhân và hoạt động của bạn luôn được bảo vệ an toàn.'
    }
  ];

  return (
    <Container maxWidth="md" sx={{mt:6}}>
      <Paper elevation={4} sx={{p:5, textAlign: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)'}}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{mb:2}}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <ForumIcon fontSize="large" />
          </Avatar>
          <Typography variant="h3" fontWeight={700} color="primary.main">
            Diễn đàn SV
          </Typography>
        </Stack>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nơi sinh viên hỏi đáp, chia sẻ kiến thức và kết nối cộng đồng!
        </Typography>
        {/* Layout kim tự tháp */}
        <Box sx={{ mt: 6, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          {/* Đỉnh kim tự tháp */}
          <Paper elevation={3} sx={{ p: 3, minWidth: 260, maxWidth: 350, mb: 2, background: '#fffbe7' }}>
            <Stack alignItems="center" spacing={1}>
              {highlights[0].icon}
              <Typography variant="h6" fontWeight={700}>{highlights[0].title}</Typography>
              <Typography variant="body2" color="text.secondary">{highlights[0].desc}</Typography>
            </Stack>
          </Paper>
          {/* Tầng giữa */}
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            {[highlights[1], highlights[2]].map((item, idx) => (
              <Paper key={item.title} elevation={2} sx={{ p: 3, minWidth: 220, background: '#f0f7fa' }}>
                <Stack alignItems="center" spacing={1}>
                  {item.icon}
                  <Typography variant="subtitle1" fontWeight={600}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Stack>
              </Paper>
            ))}
          </Box>
          {/* Tầng đáy */}
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            {[highlights[3], highlights[4]].map((item, idx) => (
              <Paper key={item.title} elevation={1} sx={{ p: 3, minWidth: 200, background: '#f5f5f5' }}>
                <Stack alignItems="center" spacing={1}>
                  {item.icon}
                  <Typography variant="subtitle2" fontWeight={600}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Box>
        <Box sx={{mt:2, display:'flex', justifyContent:'center', gap:2}}>
          <Button variant="contained" color="primary" component={Link} to="/questions" size="large">Khám phá câu hỏi</Button>
          {!user && <Button variant="outlined" color="primary" component={Link} to="/login" size="large">Đăng nhập</Button>}
          {!user && <Button variant="outlined" color="secondary" component={Link} to="/register" size="large">Đăng ký</Button>}
          {user && <Button variant="contained" color="success" component={Link} to="/questions/new" size="large">Đặt câu hỏi mới</Button>}
        </Box>
        {/* Nút Thông tin cá nhân đã chuyển sang sidebar, không hiển thị ở Home nữa */}
      </Paper>
    </Container>
  );
}
