const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) return res.status(302).redirect('/auth/');
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      res.status(302).redirect("/auth/");
      return;
    }

    req.user = user;
    next();
  });
};

module.exports = authMiddleware;
