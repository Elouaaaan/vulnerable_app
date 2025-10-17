var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/authMiddleware');

router.get('/', function(req, res, next) {
  const token = req.cookies?.jwt;
  let isLoggedIn = false;
  let userName = 'Guest';
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const user = jwt.verify(token, process.env.JWT_SECRET);
      isLoggedIn = true;
      userName = user.name || 'User';
    } catch (err) {
      console.log("JWT verification failed:", err.message);
    }
  }
  
  const isAdmin = req.cookies?.isAdmin === 'true';
  
  res.render('index', { 
    title: 'MediConnect',
    isLoggedIn: isLoggedIn,
    userName: userName,
    isAdmin: isAdmin
  });
});

module.exports = router;
