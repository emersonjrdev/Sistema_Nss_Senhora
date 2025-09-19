const mongoose = require('mongoose');

const ServidorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  funcao: { type: String },
  inicio: { type: String },
  local: { type: String },
  imagem: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Servidor', ServidorSchema);
