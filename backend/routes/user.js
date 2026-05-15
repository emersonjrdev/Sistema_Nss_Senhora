// routes/user.js
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");const requireEditor = require("../middleware/requireEditor");

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

function digitsOnly(s) {
  return String(s || "").replace(/\D/g, "");
}

function verifySelfAccess(user, body) {
  const t4 = digitsOnly(body.telefoneUltimos4 || "");
  const phone = digitsOnly(user.telefone || "");
  const okPhone = phone.length >= 4 && t4.length >= 4 && phone.slice(-4) === t4.slice(-4);

  let okBirth = false;
  const raw = String(body.verificacaoNascimento || "").trim();
  if (raw && user.nascimento) {
    const d = new Date(user.nascimento);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    okBirth = raw === `${y}-${m}-${day}`;
  }
  return okPhone || okBirth;
}

const SELF_UPDATE_FIELDS = [
  "photo",
  "funcao",
  "inicio",
  "local",
  "telefone",
  "nascimento",
  "comunidade",
  "status",
  "observacoes",
];

/** Confirma identidade sem token de editor (últimos 4 do telefone ou nascimento). */
router.post("/self-verify/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID inválido." });
    }
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: "Not found" });
    if (!verifySelfAccess(u, req.body)) {
      return res.status(403).json({ error: "Dados de verificação incorretos." });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Atualização pelo próprio servidor (sem nome; verificação obrigatória no corpo). */
router.put("/self-service/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID inválido." });
    }
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: "Not found" });
    if (!verifySelfAccess(u, req.body)) {
      return res.status(403).json({ error: "Dados de verificação incorretos." });
    }

    const patch = {};
    for (const key of SELF_UPDATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        patch[key] = req.body[key];
      }
    }
    if (Object.prototype.hasOwnProperty.call(patch, "inicio")) {
      patch.inicio = dayStringToNullableDate(patch.inicio);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "nascimento")) {
      patch.nascimento = dayStringToNullableDate(patch.nascimento);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
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
