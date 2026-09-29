const express = require('express');
const router = express.Router();
const { obtenerDisfraces, crearDisfraz, eliminarDisfraz } = require('../controllers/disfrazController');
const { uploadSingle, processImage } = require('../middlewares/uploadMiddleware');

router.get('/', obtenerDisfraces);
router.post('/', uploadSingle, processImage, crearDisfraz);
router.delete('/:id', eliminarDisfraz);

module.exports = router;