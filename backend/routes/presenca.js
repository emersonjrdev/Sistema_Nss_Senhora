const express = require("express");
const mongoose = require("mongoose");
const PresencaEvento = require("../models/PresencaEvento");

const router = express.Router();

function isOid(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

/** GET mapa { [servidorId]: status } */
router.get("/evento/:eventoId", async (req, res) => {
  try {
    const { eventoId } = req.params;
    if (!isOid(eventoId)) return res.status(400).json({ error: "eventoId inválido" });
    const doc = await PresencaEvento.findOne({ evento: eventoId }).lean();
    if (!doc || doc.statuses == null) {
      return res.json({});
    }
    const out = {};
    const st = doc.statuses;
    if (st instanceof Map) {
      st.forEach((v, k) => {
        out[String(k)] = v;
      });
    } else if (typeof st === "object") {
      for (const [k, v] of Object.entries(st)) {
        out[String(k)] = v;
      }
    }
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH body: { servidorId, status } — status vazio remove */
router.patch("/evento/:eventoId", async (req, res) => {
  try {
    const { eventoId } = req.params;
    if (!isOid(eventoId)) return res.status(400).json({ error: "eventoId inválido" });
    const { servidorId, status } = req.body;
    if (!servidorId || typeof servidorId !== "string") {
      return res.status(400).json({ error: "servidorId obrigatório" });
    }

    let doc = await PresencaEvento.findOne({ evento: eventoId });
    if (!doc) {
      doc = new PresencaEvento({ evento: eventoId, statuses: new Map() });
    }
    if (!doc.statuses) doc.statuses = new Map();

    const sid = String(servidorId);
    if (!status) {
      doc.statuses.delete(sid);
    } else {
      doc.statuses.set(sid, String(status));
    }
    await doc.save();

    const out = {};
    doc.statuses.forEach((v, k) => {
      out[String(k)] = v;
    });
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
