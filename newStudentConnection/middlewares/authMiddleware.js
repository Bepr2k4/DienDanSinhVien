const admin = require('../firebaseAdmin').admin;

async function verifyFirebaseToken(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'Thiếu token xác thực.' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Gắn thông tin user vào request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

module.exports = verifyFirebaseToken;
