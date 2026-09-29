require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/disfraces', require('./src/routes/disfrazRoutes'));
app.use('/api/alquileres', require('./src/routes/alquilerRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Mystika ejecutándose en puerto ${PORT}`));