const express = require("express");
const mongoose = require("mongoose");
const HistoricoEntrada = require("../models/HistoricoEntrada");

const router = express.Router();

function isOid(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

router.get("/", async (req, res) => {
  try {
    const { servidorId } = req.query;
    if (!servidorId || !isOid(String(servidorId))) {
      return res.status(400).json({ error: "servidorId válido obrigatório na query" });
    }
    const list = await HistoricoEntrada.find({ servidor: servidorId })
      .sort({ data: -1, createdAt: -1 })
      .lean();
    res.json(
      list.map((d) => ({
        id: String(d._id),
        data: d.data,
        texto: d.texto,
        createdAt: d.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { servidorId, data, texto } = req.body;
    if (!servidorId || !isOid(String(servidorId))) {
      return res.status(400).json({ error: "servidorId inválido" });
    }
    const t = String(texto || "").trim();
    if (!t) return res.status(400).json({ error: "Texto obrigatório" });
    const dataStr =
      data ||
      new Date().toISOString().split("T")[0];
    const doc = await HistoricoEntrada.create({
      servidor: servidorId,
      data: dataStr,
      texto: t,
    });
    const o = doc.toObject();
    res.status(201).json({
      id: String(o._id),
      data: o.data,
      texto: o.texto,
      createdAt: o.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isOid(id)) return res.status(400).json({ error: "ID inválido" });
    const r = await HistoricoEntrada.findByIdAndDelete(id);
    if (!r) return res.status(404).json({ error: "Não encontrado" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
