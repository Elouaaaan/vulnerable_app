const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.jwt;
  console.log("Extracted JWT from cookies:", token);
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      res.status(302).redirect("/auth");
      return;
    }

    req.user = user;
    next();
  });
};

module.exports = authMiddleware;
