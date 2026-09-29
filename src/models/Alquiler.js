const mongoose = require('mongoose');

const AlquilerSchema = new mongoose.Schema({
  cedulaCliente: { type: String, required: true },
  nombreCliente: { type: String, required: true },
  telefonoCliente: { type: String, required: true },
  disfrazId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disfraz', required: true },
  cantidad: { type: Number, default: 1 },
  fechaAlquiler: { type: Date, default: Date.now },
  fechaDevolucionProgramada: { type: Date, required: true },
  estado: { type: String, enum: ['ACTIVO', 'DEVUELTO'], default: 'ACTIVO' }
}, { timestamps: true });

module.exports = mongoose.model('Alquiler', AlquilerSchema);