const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinaryConfig');
const streamifier = require('streamifier');

// Helper to upload buffer to Cloudinary
function uploadToCloudinary(buffer, folder = 'sistema_nss') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// GET all
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    let imagemUrl = '';
    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer);
      imagemUrl = result.secure_url;
    }
    const { nome, descricao, data } = req.body;
    const item = new Item({ nome, descricao, data: data || undefined, imagemUrl });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, descricao, data } = req.body;
    const update = { nome, descricao };
    if (data) update.data = data;
    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer);
      update.imagemUrl = result.secure_url;
    }
    const item = await Item.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Deleted', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;