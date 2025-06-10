const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

const DATA_DIR = path.join(__dirname, 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function loadJson(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}
function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let questions = loadJson(QUESTIONS_FILE);
let users = loadJson(USERS_FILE);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

app.get('/', (req, res) => {
  res.render('index', {user: req.session.user});
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const {username, password} = req.body;
  if (users.find(u => u.username === username)) {
    return res.send('User exists');
  }
  users.push({username, password, tags: {}});
  saveJson(USERS_FILE, users);
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const {username, password} = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.user = {username, isAdmin: true};
    return res.redirect('/admin');
  }
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.send('Invalid credentials');
  req.session.user = {username, isAdmin: false};
  res.redirect('/');
});

function ensureAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
function ensureAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) return res.redirect('/login');
  next();
}

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/admin', ensureAdmin, (req, res) => {
  res.render('admin', {questions});
});

app.post('/admin/add', ensureAdmin, (req, res) => {
  const {text, answer, tags} = req.body;
  const id = questions.length + 1;
  const tagList = tags ? tags.split(',').map(t => t.trim()) : [];
  questions.push({id, text, answer, tags: tagList});
  saveJson(QUESTIONS_FILE, questions);
  res.redirect('/admin');
});

app.get('/questions', ensureAuth, (req, res) => {
  const tag = req.query.tag;
  let list = questions;
  if (tag) list = list.filter(q => q.tags.includes(tag));
  res.render('questions', {questions: list, tag});
});

app.get('/question/:id', ensureAuth, (req, res) => {
  const q = questions.find(q => q.id == req.params.id);
  if (!q) return res.send('Question not found');
  const user = users.find(u => u.username === req.session.user.username);
  const status = user.tags[q.id] || '';
  res.render('question', {q, status});
});

app.post('/question/:id/mark', ensureAuth, (req, res) => {
  const {status} = req.body; // 'understood' or 'not'
  const user = users.find(u => u.username === req.session.user.username);
  user.tags[req.params.id] = status;
  saveJson(USERS_FILE, users);
  res.redirect('/question/' + req.params.id);
});

app.get('/my', ensureAuth, (req, res) => {
  const user = users.find(u => u.username === req.session.user.username);
  const filter = req.query.filter; // e.g., 'not'
  const ids = Object.keys(user.tags).filter(id => !filter || user.tags[id] === filter);
  const list = questions.filter(q => ids.includes(String(q.id)));
  res.render('my', {questions: list, filter});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on ' + PORT));

