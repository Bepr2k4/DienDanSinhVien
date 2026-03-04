const express = require('express');
const cors = require('cors');
const { db } = require('./firebaseAdmin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const questionRouter = require('./routes/question');
app.use('/api/questions', questionRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const userRouter = require('./routes/user');
app.use('/api/users', userRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
