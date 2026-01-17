const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { csrfSync } = require('csrf-sync');

const app = express();
const PORT = process.env.PORT || 5400;
const DATA_FILE = path.join(__dirname, 'data.json');

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// CSRF protection using cookies for state storage
const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req) => req.body._csrf || req.headers['x-csrf-token'],
  getTokenFromState: (req) => req.cookies['csrf-token'],
  storeTokenInState: (req, res, token) => {
    res.cookie('csrf-token', token, { httpOnly: true, sameSite: 'strict' });
  }
});

// Middleware
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load data from file or initialize empty array
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
  return [];
}

// Save data to file
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Home page - display counts
app.get('/', (req, res) => {
  const counts = loadData();
  const csrfToken = generateToken(req, res);
  res.render('index', {
    title: 'Rami Gin Scores',
    counts: counts,
    csrfToken: csrfToken
  });
});

// Add new count
app.post('/add', csrfSynchronisedProtection, (req, res) => {
  const { player, points } = req.body;
  const counts = loadData();

  const newEntry = {
    id: generateId(),
    datetime: new Date().toISOString(),
    kaille: player === 'Kaille' ? parseInt(points) || 0 : 0,
    francis: player === 'Francis' ? parseInt(points) || 0 : 0
  };

  counts.push(newEntry);
  saveData(counts);

  res.redirect('/');
});

// API endpoint for adding (for fetch requests)
app.post('/api/add', csrfSynchronisedProtection, (req, res) => {
  const { player, points } = req.body;
  const counts = loadData();

  const newEntry = {
    id: generateId(),
    datetime: new Date().toISOString(),
    kaille: player === 'Kaille' ? parseInt(points) || 0 : 0,
    francis: player === 'Francis' ? parseInt(points) || 0 : 0
  };

  counts.push(newEntry);
  saveData(counts);

  res.json({ success: true, entry: newEntry });
});

// API endpoint for deleting an entry
app.delete('/api/delete/:id', csrfSynchronisedProtection, (req, res) => {
  const { id } = req.params;
  let counts = loadData();

  const initialLength = counts.length;
  counts = counts.filter(entry => entry.id !== id);

  if (counts.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Entry not found' });
  }

  saveData(counts);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Ramin Gin Count running at http://localhost:${PORT}`);
});
