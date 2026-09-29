/*const express = require('express');
const router = express.Router();
const { crearAlquiler, obtenerAlquileres } = require('../controllers/alquilerController');

router.get('/', obtenerAlquileres);
router.post('/', crearAlquiler);

module.exports = router;*/

const express = require('express');
const router = express.Router();
const { crearAlquiler, obtenerAlquileres, marcarDevuelto } = require('../controllers/alquilerController');

router.get('/', obtenerAlquileres);
router.post('/', crearAlquiler);
router.put('/:id/devolver', marcarDevuelto);

module.exports = router;