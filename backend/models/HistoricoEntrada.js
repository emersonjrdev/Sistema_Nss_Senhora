const mongoose = require("mongoose");

const HistoricoEntradaSchema = new mongoose.Schema(
  {
    servidor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    data: { type: String, required: true },
    texto: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

HistoricoEntradaSchema.index({ servidor: 1, data: -1 });

module.exports = mongoose.model("HistoricoEntrada", HistoricoEntradaSchema);
