const express = require('express');
const router = express.Router();
const Servidor = require('../models/Servidor');

// List all
router.get('/', async (req, res) => {
  try {
    const servidores = await Servidor.find().sort({ createdAt: -1 });
    res.json(servidores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const s = await Servidor.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const { nome, funcao, inicio, local, imagem } = req.body;
    const newS = await Servidor.create({ nome, funcao, inicio, local, imagem });
    res.status(201).json(newS);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updated = await Servidor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Servidor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
