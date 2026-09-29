const Disfraz = require('../models/Disfraz');

exports.obtenerDisfraces = async (req, res) => {
  try {
    const disfraces = await Disfraz.find().sort({ createdAt: -1 });
    res.json(disfraces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.crearDisfraz = async (req, res) => {
  try {
    const { nombre, categoria, talla, precioAlquiler, stockTotal } = req.body;
    const nuevoDisfraz = new Disfraz({
      nombre,
      categoria,
      talla,
      precioAlquiler,
      stockTotal: Number(stockTotal),
      stockDisponible: Number(stockTotal),
      imagenUrl: req.body.imagenUrl || '/uploads/default.jpg'
    });
    await nuevoDisfraz.save();
    res.status(201).json(nuevoDisfraz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarDisfraz = async (req, res) => {
  try {
    const { pin } = req.body;
    if (pin !== process.env.SECURITY_PIN) {
      return res.status(401).json({ error: 'PIN de seguridad incorrecto' });
    }
    await Disfraz.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Disfraz eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};