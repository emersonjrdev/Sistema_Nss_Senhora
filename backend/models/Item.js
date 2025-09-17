const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  imagemUrl: { type: String },
  descricao: { type: String },
  data: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);