const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5400;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
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
  res.render('index', {
    title: 'Ramin Gin Count',
    counts: counts
  });
});

// Add new count
app.post('/add', (req, res) => {
  const { player, points } = req.body;
  const counts = loadData();

  const newEntry = {
    date: new Date().toLocaleDateString('fr-FR'),
    kaille: player === 'Kaille' ? parseInt(points) || 0 : 0,
    francis: player === 'Francis' ? parseInt(points) || 0 : 0
  };

  counts.push(newEntry);
  saveData(counts);

  res.redirect('/');
});

// API endpoint for adding (for fetch requests)
app.post('/api/add', (req, res) => {
  const { player, points } = req.body;
  const counts = loadData();

  const newEntry = {
    date: new Date().toLocaleDateString('fr-FR'),
    kaille: player === 'Kaille' ? parseInt(points) || 0 : 0,
    francis: player === 'Francis' ? parseInt(points) || 0 : 0
  };

  counts.push(newEntry);
  saveData(counts);

  res.json({ success: true, entry: newEntry });
});

app.listen(PORT, () => {
  console.log(`Ramin Gin Count running at http://localhost:${PORT}`);
});
