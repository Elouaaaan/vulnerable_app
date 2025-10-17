var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

router.get('/', function(req, res, next) {
  if (req.user) {
    return res.redirect('/');
  }

  res.render('auth');
});

router.post('/login', function(req, res, next) {
  if (!req.body) {
    res.status(400);
    return res.render('auth', { error: 'Missing request body' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return res.render('auth', { error: 'Email and password are required' });
  }

  db.any('SELECT * FROM users WHERE email = $1', [email])
    .then(user => {
      if (user.length === 0) {
        res.status(401);
        return res.render('auth', { error: 'Invalid credentials' });
      }

      bcrypt.compare(password, user[0].password_hash, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500);
          return res.render('auth', { error: 'Internal server error' });
        }
        if (!result) {
          res.status(401);
          return res.render('auth', { error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user[0].id, name: user[0].name, surname: user[0].surname, email: user[0].email, role: user[0].role }, 
          process.env.JWT_SECRET, 
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res
          .status(302)
          .cookie(
            'jwt', 
            token, 
            { 
              sameSite: "Strict", 
              httpOnly: true, 
              maxAge: parseInt(process.env.COOKIE_EXPIRES_IN),
              path: '/'
            })
          .redirect('/');
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500);
      res.render('auth', { error: 'Internal server error' });
    });
});

router.post('/register', function(req, res, next) {
  if (!req.body) {
    res.status(400);
    return res.render('auth', { error: 'Missing request body' });
  }

  const { name, surname, email, password, passwordConfirm } = req.body;

  if (!name || !surname || !email || !password || !passwordConfirm) {
    res.status(400);
    return res.render('auth', { error: 'Name, surname, email, password and password confirmation are required' });
  }

  if (password !== passwordConfirm) {
    res.status(400);
    return res.render('auth', { error: 'Passwords do not match' });
  }

  db.any('SELECT COUNT(*) FROM users WHERE email = $1', [email])
    .then(result => {
      if (result[0].count > 0) {
        res.status(409);
        return res.render('auth', { error: 'Email already in use' });
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error(err);
          res.status(500);
          return res.render('auth', { error: 'Internal server error' });
        }

        db.one(
            'INSERT INTO users (name, surname, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, surname, email, role',
            [name, surname, email, hash, 'patient']
          )
          .then(newUser => {
            const token = jwt.sign(
              { id: newUser.id, name: newUser.name, surname: newUser.surname, email: newUser.email, role: newUser.role },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res
              .status(302)
              .cookie('jwt', token, {
                sameSite: 'Strict',
                httpOnly: true,
                maxAge: parseInt(process.env.COOKIE_EXPIRES_IN),
                path: '/'
              })
              .redirect('/');
          })
          .catch(err => {
            console.error(err);
            res.status(500);
            res.render('auth', { error: 'Internal server error' });
          });
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500);
      res.render('auth', { error: 'Internal server error' });
    });
});

router.get('/logout', function(req, res, next) {
  res.clearCookie('jwt');
  res.clearCookie('isAdmin');
  res.redirect('/');
});

module.exports = router;

// Logout clears the JWT cookie and redirects to auth
router.get('/logout', function(req, res, next) {
  try {
    res.clearCookie('jwt', { path: '/' });
  } catch (e) {
    console.error('Error clearing cookie on logout:', e);
  }
  return res.redirect('/auth/');
});
