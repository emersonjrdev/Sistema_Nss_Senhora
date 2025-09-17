import cloudinaryService from './cloudinaryService';

class FileManager {
  constructor() {
    this.files = JSON.parse(localStorage.getItem('igreja_files')) || [];
  }

  async uploadFile(file) {
    try {
      // Upload para Cloudinary
      const cloudinaryResult = await cloudinaryService.uploadFile(file);
      
      // Salvar localmente
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        uploadDate: new Date().toISOString()
      };

      this.files.push(fileData);
      this.saveToLocalStorage();
      
      return fileData;

    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    const fileIndex = this.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      throw new Error('Arquivo não encontrado');
    }

    const file = this.files[fileIndex];
    
    try {
      // Deletar do Cloudinary
      await cloudinaryService.deleteFile(file.publicId);
      
      // Remover localmente
      this.files.splice(fileIndex, 1);
      this.saveToLocalStorage();
      
      return true;

    } catch (error) {
      console.error('Erro ao deletar:', error);
      throw error;
    }
  }

  getFiles() {
    return this.files;
  }

  getFileById(fileId) {
    return this.files.find(f => f.id === fileId);
  }

  saveToLocalStorage() {
    localStorage.setItem('igreja_files', JSON.stringify(this.files));
  }
}

export default new FileManager();