const Disfraz = require('../models/Disfraz');
const Alquiler = require('../models/Alquiler');

exports.obtenerDisfraces = async (req, res) => {
  try {
    const disfraces = await Disfraz.find().sort({ createdAt: -1 });
    res.json(disfraces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Funcion crear disfraz y actualizar precio
exports.crearDisfraz = async (req, res) => {
  try {
    const { nombre, categoria, talla, precioAlquiler, stockTotal, pin } = req.body;

    if (pin !== process.env.SECURITY_PIN) {
      return res.status(401).json({ error: 'PIN de seguridad incorrecto para agregar disfraz' });
    }

    const nuevoDisfraz = new Disfraz({
      nombre,
      categoria,
      talla,
      precioAlquiler: Number(precioAlquiler),
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

// Cambiar precio de un disfraz (Descuentos)
exports.actualizarPrecio = async (req, res) => {
  try {
    const { precioAlquiler, pin } = req.body;
    if (pin !== process.env.SECURITY_PIN) {
      return res.status(401).json({ error: 'PIN de seguridad incorrecto' });
    }

    const disfraz = await Disfraz.findByIdAndUpdate(
      req.params.id,
      { precioAlquiler: Number(precioAlquiler) },
      { new: true }
    );

    res.json({ mensaje: 'Precio actualizado con éxito', disfraz });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

//Funcion para borrar el inventario
exports.vaciarInventarioCompleto = async (req, res) => {
  try {
    const { pin } = req.body;
    if (pin !== process.env.SECURITY_PIN) {
      return res.status(401).json({ error: 'PIN de seguridad incorrecto' });
    }

    // Borra todos los disfraces y los alquileres registrados
    await Disfraz.deleteMany({});
    await Alquiler.deleteMany({});

    res.json({ mensaje: 'Inventario y registros de alquileres vaciados con éxito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};