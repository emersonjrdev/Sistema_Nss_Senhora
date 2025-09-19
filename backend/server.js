require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const servidoresRoutes = require('./routes/servidores');

const app = express();

app.use(cors());
app.use(express.json());

// mount routes
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/servidores', servidoresRoutes);

// simple root
app.get('/', (req, res) => res.send('API running'));

// connect to mongo
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set. Set it in your environment (.env or Render).');
} else {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(async () => {
      console.log('✅ Conectado ao MongoDB Atlas');
      try {
        console.log('📂 Database Name:', mongoose.connection.db.databaseName);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📑 Collections:', collections.map(c => c.name));
      } catch (e) {
        console.log('ℹ️ Não foi possível listar collections:', e.message);
      }
    })
    .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
