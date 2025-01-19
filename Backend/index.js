const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const locationRoutes = require('./routes/locationRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

connectDB(process.env.MONGODB_URI);

app.get('/', (req, res) => {
  res.send('Api Fuchibol');
});

app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/locations', locationRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});