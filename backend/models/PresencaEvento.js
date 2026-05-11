const mongoose = require("mongoose");

/** Um documento por evento: mapa servidorId (string) → status */
const PresencaEventoSchema = new mongoose.Schema(
  {
    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: true,
      unique: true,
    },
    statuses: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PresencaEvento", PresencaEventoSchema);
