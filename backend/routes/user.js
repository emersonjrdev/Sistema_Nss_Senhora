// routes/user.js
const express = require("express");
const User = require("../models/User");
const requireEditor = require("../middleware/requireEditor");

const router = express.Router();

/** Converte YYYY-MM-DD em Date ao meio-dia UTC (evita mudar o dia civil no fuso local). */
function dayStringToNullableDate(value) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (value === "") return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return value;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(Date.UTC(y, mo, d, 12, 0, 0, 0));
}

// Criar usuário → POST /api/user
router.post("/", requireEditor, async (req, res) => {
  try {
    const {
      name,
      photo,
      funcao,
      inicio,
      local,
      telefone,
      nascimento,
      comunidade,
      status,
      observacoes,
      createdAt,
    } = req.body;

    const newUser = await User.create({
      name,
      photo,
      funcao,
      inicio: dayStringToNullableDate(inicio),
      local,
      telefone,
      nascimento: dayStringToNullableDate(nascimento),
      comunidade,
      status,
      observacoes,
      createdAt,
    });
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
router.put("/:id", requireEditor, async (req, res) => {
  try {
    const body = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(body, "inicio")) {
      body.inicio = dayStringToNullableDate(body.inicio);
    }
    if (Object.prototype.hasOwnProperty.call(body, "nascimento")) {
      body.nascimento = dayStringToNullableDate(body.nascimento);
    }
    const updated = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar usuário → DELETE /api/user/:id
router.delete("/:id", requireEditor, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
