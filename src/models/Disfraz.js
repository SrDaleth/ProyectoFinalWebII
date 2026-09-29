const mongoose = require('mongoose');

const DisfrazSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  talla: { type: String, required: true },
  precioAlquiler: { type: Number, required: true },
  stockTotal: { type: Number, required: true, min: 0 },
  stockDisponible: { type: Number, required: true, min: 0 },
  imagenUrl: { type: String, default: '/uploads/default-costume.jpg' }
}, { timestamps: true });

module.exports = mongoose.model('Disfraz', DisfrazSchema);