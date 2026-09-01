const express = require('express');
const path = require('path');

const adminRoutes = require('./routes/admin');
const gameRoutes = require('./routes/game');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);

app.listen(PORT, () => {
  console.log(`Flag Guess Game server running at http://localhost:${PORT}`);
});
