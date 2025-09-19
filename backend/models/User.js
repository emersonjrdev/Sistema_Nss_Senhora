const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String }, // URL da imagem no Cloudinary
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
