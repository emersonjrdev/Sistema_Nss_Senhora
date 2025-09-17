export const uploadService = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha no upload");
      }

      const data = await response.json();
      return data.url; // backend retorna a URL da imagem
    } catch (error) {
      console.error("Erro no upload:", error);
      throw error;
    }
  },
};
