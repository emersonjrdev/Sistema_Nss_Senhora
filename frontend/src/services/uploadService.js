// frontend/src/services/uploadService.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const uploadService = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha no upload");
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error("Erro no upload:", err);
      throw err;
    }
  },
};
