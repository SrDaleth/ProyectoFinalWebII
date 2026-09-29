const Alquiler = require('../models/Alquiler');
const Disfraz = require('../models/Disfraz');

exports.crearAlquiler = async (req, res) => {
  try {
    const { cedulaCliente, nombreCliente, telefonoCliente, disfrazId, fechaDevolucionProgramada, pin } = req.body;

    if (pin !== process.env.SECURITY_PIN) {
      return res.status(401).json({ error: 'PIN de confirmación incorrecto' });
    }

    const disfraz = await Disfraz.findById(disfrazId);
    if (!disfraz) return res.status(404).json({ error: 'Disfraz no encontrado' });

    if (disfraz.stockDisponible < 1) {
      return res.status(400).json({ error: 'No hay stock disponible para este disfraz' });
    }

    // Descontar stock
    disfraz.stockDisponible -= 1;
    await disfraz.save();

    // Crear registro de alquiler vinculando la Cédula
    const alquiler = new Alquiler({
      cedulaCliente,
      nombreCliente,
      telefonoCliente,
      disfrazId,
      fechaDevolucionProgramada: new Date(fechaDevolucionProgramada)
    });

    await alquiler.save();
    res.status(201).json({ mensaje: 'Alquiler registrado exitosamente', alquiler, stockRestante: disfraz.stockDisponible });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerAlquileres = async (req, res) => {
  try {
    const { cedula } = req.query;
    const filtro = cedula ? { cedulaCliente: cedula } : {};
    const alquileres = await Alquiler.find(filtro).populate('disfrazId').sort({ createdAt: -1 });
    res.json(alquileres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};