var express = require('express');
var router = express.Router();

let users = []; // Array to store user data (in-memory for simplicity)

/* GET /users - View user profile */
router.get('/', function (req, res, next) {
  const user = req.session.user; // Assuming session middleware is used
  if (!user) {
    return res.redirect('/users/login');
  }
  res.render('user-profile', { title: 'User Profile', user });
});

/* GET /users/register - Render registration form */
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

/* POST /users/register - Handle user registration */
router.post('/register', function (req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).send('Username already exists.');
  }
  users.push({ username, password });
  res.redirect('/users/login');
});

/* GET /users/login - Render login form */
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login' });
});

/* POST /users/login - Handle user login */
router.post('/login', function (req, res, next) {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).send('Invalid username or password.');
  }
  req.session.user = user; // Assuming session middleware is used
  res.redirect('/');
});

/* GET /users/logout - Handle user logout */
router.get('/logout', function (req, res, next) {
  req.session.destroy(); // Assuming session middleware is used
  res.redirect('/users/login');
});

module.exports = router;
