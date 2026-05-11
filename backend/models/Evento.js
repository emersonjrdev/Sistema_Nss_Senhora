const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    data: { type: String, required: true },
    hora: { type: String, default: null },
    local: { type: String, default: null },
    tipo: { type: String, default: "Missa" },
    observacoes: { type: String, default: null },
  },
  { timestamps: true }
);

EventoSchema.index({ data: 1 });

module.exports = mongoose.model("Evento", EventoSchema);
