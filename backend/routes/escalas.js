const express = require("express");
const mongoose = require("mongoose");
const Escala = require("../models/Escala");

const router = express.Router();

function isOid(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

router.get("/", async (req, res) => {
  try {
    const list = await Escala.find().sort({ data: -1 }).lean();
    res.json(
      list.map((d) => ({
        ...d,
        id: String(d._id),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { titulo, data, observacoes, atribuicoes, eventoId } = req.body;
    if (!titulo || !data) {
      return res.status(400).json({ error: "Título e data são obrigatórios" });
    }
    const eid = eventoId ? String(eventoId).trim() : null;
    if (eid) {
      const dup = await Escala.findOne({ eventoId: eid });
      if (dup) {
        return res.status(409).json({ error: "Já existe escala vinculada a este evento." });
      }
    }
    const doc = await Escala.create({
      titulo: String(titulo).trim(),
      data,
      observacoes: observacoes || null,
      atribuicoes: Array.isArray(atribuicoes) ? atribuicoes : [],
      eventoId: eid || null,
    });
    const o = doc.toObject();
    res.status(201).json({ ...o, id: String(o._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isOid(id)) return res.status(400).json({ error: "ID inválido" });
    const patch = { ...req.body };
    if (patch.atribuicoes != null && !Array.isArray(patch.atribuicoes)) {
      return res.status(400).json({ error: "atribuicoes deve ser array" });
    }
    if (Object.prototype.hasOwnProperty.call(patch, "eventoId")) {
      const eid = patch.eventoId ? String(patch.eventoId).trim() : null;
      patch.eventoId = eid || null;
      if (eid) {
        const dup = await Escala.findOne({ eventoId: eid, _id: { $ne: id } });
        if (dup) {
          return res.status(409).json({ error: "Já existe escala vinculada a este evento." });
        }
      }
    }
    const updated = await Escala.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return res.status(404).json({ error: "Não encontrado" });
    res.json({ ...updated, id: String(updated._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isOid(id)) return res.status(400).json({ error: "ID inválido" });
    await Escala.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
