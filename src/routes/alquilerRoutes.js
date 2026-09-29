const express = require('express');
const router = express.Router();
const { crearAlquiler, obtenerAlquileres } = require('../controllers/alquilerController');

router.get('/', obtenerAlquileres);
router.post('/', crearAlquiler);

module.exports = router;