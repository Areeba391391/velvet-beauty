/* ============================================================
   VELVET BEAUTY — server.js
   Simple Express server to serve the frontend files
   Run: node server.js  →  http://localhost:3000
   ============================================================ */

const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

// Serve static files from /public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve all HTML pages from /views
app.use('/views', express.static(path.join(__dirname, 'views')));

// Root → redirect to homepage
app.get('/', (req, res) => {
  res.redirect('/views/index.html');
});

// Catch-all for direct HTML file access
app.get('/:page.html', (req, res) => {
  const file = path.join(__dirname, 'views', req.params.page + '.html');
  res.sendFile(file, err => {
    if (err) res.redirect('/views/index.html');
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ✨  Velvet Beauty is running!');
  console.log(`  🌐  Open: http://localhost:${PORT}`);
  console.log('');
  console.log('  👑  Owner login:    owner@velvetbeauty.pk / owner123');
  console.log('  🏷️   Employee login: employee@velvetbeauty.pk / emp123');
  console.log('  👤  Register a customer account on the login page');
  console.log('');
});
