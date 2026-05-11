const mongoose = require("mongoose");

const AtribuicaoSchema = new mongoose.Schema(
  {
    servidorId: { type: String, required: true },
    nome: { type: String, default: "" },
    funcao: { type: String, default: "" },
  },
  { _id: false }
);

const EscalaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    data: { type: String, required: true },
    observacoes: { type: String, default: null },
    atribuicoes: { type: [AtribuicaoSchema], default: [] },
  },
  { timestamps: true }
);

EscalaSchema.index({ data: 1 });

module.exports = mongoose.model("Escala", EscalaSchema);
