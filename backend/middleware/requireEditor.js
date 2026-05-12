const jwt = require("jsonwebtoken");

function isAuthConfigured() {
  const pw = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET;
  return Boolean(pw && String(pw).length > 0 && secret && String(secret).length > 0);
}

/**
 * Protege POST/PUT/PATCH/DELETE. Se ADMIN_PASSWORD e JWT_SECRET não estiverem definidos, não exige token (compatível com deploys antigos).
 */
function requireEditor(req, res, next) {
  if (!isAuthConfigured()) {
    return next();
  }
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Edição requer autenticação." });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "editor") {
      return res.status(403).json({ error: "Proibido." });
    }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
}

requireEditor.isConfigured = isAuthConfigured;
module.exports = requireEditor;
