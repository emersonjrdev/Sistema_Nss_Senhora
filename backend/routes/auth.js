const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const requireEditor = require("../middleware/requireEditor");

const router = express.Router();

function hashPw(s) {
  return crypto.createHash("sha256").update(String(s), "utf8").digest("hex");
}

router.get("/status", (req, res) => {
  res.json({ editorAuthRequired: requireEditor.isConfigured() });
});

router.post("/login", (req, res) => {
  try {
    if (!requireEditor.isConfigured()) {
      return res.status(503).json({
        code: "AUTH_NOT_CONFIGURED",
        error: "Autenticação de edição não configurada no servidor (ADMIN_PASSWORD e JWT_SECRET).",
      });
    }
    const password = String(req.body.password || "");
    const expected = process.env.ADMIN_PASSWORD;
    if (hashPw(password) !== hashPw(expected)) {
      return res.status(401).json({ error: "Senha incorreta." });
    }
    const token = jwt.sign({ role: "editor" }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
