const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // nome do usuário
    email: {
      type: String,
      unique: false, // remove a restrição
      sparse: true, // só aplica unique se existir valor
    },
    // email único (se for usar)
    photo: { type: String }, // URL da imagem no Cloudinary

    // campos extras do formulário
    funcao: { type: String },
    inicio: { type: Date },
    local: { type: String },
  },
  { timestamps: true }
);

// índices de busca
UserSchema.index({ name: 1, funcao: 1 });

module.exports = mongoose.model("User", UserSchema);
