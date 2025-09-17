class CloudinaryService {
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Falha no upload');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        size: data.bytes
      };

    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  async deleteFile(publicId) {
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_id: publicId,
            api_key: import.meta.env.VITE_CLOUDINARY_API_KEY
          })
        }
      );

      return response.json();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      throw error;
    }
  }
}

export default new CloudinaryService();