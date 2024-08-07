const express = require('express');
const path = require('path');
const cors = require('cors');
const pokemonRoutes = require('./routes/pokemonRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Use routes
app.use('/api', pokemonRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));