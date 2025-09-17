
export const uploadService = {
  async uploadImage(file) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

console.log('Cloudinary Config:', {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
});
    
    // Verifica se as variáveis estão definidas
    if (!cloudName || !uploadPreset) {
      throw new Error('Configuração do Cloudinary não encontrada');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Resposta do Cloudinary:', errorData);
        throw new Error(`Falha no upload: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;

    } catch (error) {
      console.error('Erro detalhado no upload:', error);
      throw new Error(`Não foi possível fazer o upload da imagem: ${error.message}`);
    }
  }
};