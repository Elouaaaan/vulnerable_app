var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
