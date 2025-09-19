const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Criar usuário
router.post("/user", async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    const newUser = await User.create({ name, email, photo });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todos usuários
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
