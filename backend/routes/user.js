// routes/user.js
const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Criar usuário → POST /api/user
router.post("/", async (req, res) => {
  try {
    const { name, photo, funcao, inicio, local } = req.body;
    const newUser = await User.create({ name, photo, funcao, inicio, local });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar usuário por ID → GET /api/user/:id
router.get("/:id", async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: "Not found" });
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar usuário → PUT /api/user/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar usuário → DELETE /api/user/:id
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
