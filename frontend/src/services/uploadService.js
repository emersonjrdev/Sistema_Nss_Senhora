const CLOUDINARY_URL =
  import.meta.env.VITE_CLOUDINARY_URL || process.env.REACT_APP_CLOUDINARY_URL;
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export const uploadService = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Falha no upload");

    const data = await res.json();
    return data.secure_url; // <- link da imagem já hospedada
  },
};
