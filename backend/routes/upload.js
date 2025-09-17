const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path); // remove o arquivo temporário
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Falha no upload da imagem" });
  }
});

module.exports = router;
