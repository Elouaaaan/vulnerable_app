var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

router.get('/', function(req, res, next) {
  res.render('auth');
});

router.post('/login', function(req, res, next) {
  if (!req.body) {
    res.status(400).send({ message: "Missing request body" });
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.any('SELECT * FROM users WHERE email = $1', [email])
    .then(user => {
      console.log(user);
      if (user.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      bcrypt.compare(password, user[0].password_hash, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        if (!result) {
          console.log("Invalid password");
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log("User authenticated:", user[0]);

        const token = jwt.sign(
          { id: user[0].id, name: user[0].name, surname: user[0].surname, email: user[0].email, role: user[0].role }, 
          process.env.JWT_SECRET, 
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log("Generated JWT:", token);

        res
          .status(200)
          .cookie(
            'jwt', 
            token, 
            { 
              sameSite: "Strict", 
              httpOnly: true, 
              maxAge: parseInt(process.env.COOKIE_EXPIRES_IN),
              path: '/'
            })
          .send({ message: "User logged in", redirectTo: "/" });
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

router.post('/register', function(req, res, next) {
  if (!req.body) {
    res.status(400).send({ message: "Missing request body" });
    return;
  }

  const { name, surname, email, password, passwordConfirm } = req.body;

  if (!name || !surname || !email || !password || !passwordConfirm) {
    return res.status(400).json({ message: 'Name, surname, email, password and password confirmation are required' });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  db.any('SELECT COUNT(*) FROM users WHERE email = $1', [email])
    .then(result => {
      if (result[0].count > 0) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        db.none('INSERT INTO users (name, surname, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)', [name, surname, email, hash, 'patient'])
          .then(() => {
            res.status(201).json({ message: 'User registered successfully' });
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
          });
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


module.exports = router;
