import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { uploadService } from "../services/uploadService";

export default function ServerForm({ editing, onSaved, toast }) {
  const [name, setName] = useState("");
  const [funcao, setFuncao] = useState("");
  const [inicio, setInicio] = useState("");
  const [local, setLocal] = useState("");
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setFuncao(editing.funcao || "");
      setInicio(editing.inicio ? editing.inicio.split("T")[0] : "");
      setLocal(editing.local || "");
      setPhotoPreview(editing.photo || null);
      setFile(null);
    } else {
      setName("");
      setFuncao("");
      setInicio("");
      setLocal("");
      setFile(null);
      setPhotoPreview(null);
    }
  }, [editing]);

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast?.error("A imagem deve ter menos de 5MB");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast?.error("Por favor, selecione uma imagem válida");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  }

  function handleClear() {
    setName("");
    setFuncao("");
    setInicio("");
    setLocal("");
    setFile(null);
    setPhotoPreview(null);
    if (onSaved) onSaved();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      toast?.error("Nome é obrigatório");
      return;
    }

    try {
      setUploading(true);
      let photo = editing?.photo || null;

      if (file) {
        photo = await uploadService.uploadImage(file);
      }

      const userData = {
        name: name.trim(),
        photo,
        funcao: funcao.trim() || null,
        inicio: inicio
          ? new Date(inicio + "T00:00:00").toISOString().split("T")[0]
          : null,
        local: local.trim() || null,
      };

      if (editing?._id) {
        await storageService.updateUser(editing._id, userData);
        toast?.success("Servidor atualizado com sucesso!");
      } else {
        await storageService.createUser(userData);
        toast?.success("Servidor cadastrado com sucesso!");
      }

      handleClear();
      setUploading(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast?.error("Erro ao salvar: " + (err.message || "Tente novamente"));
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        Nome
        <input
          required
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label>
        Função
        <select
          name="funcao"
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
        >
          <option value="">Selecione a função</option>
          <option value="Acólito">Acólito</option>
          <option value="Filhas de Maria">Filhas de Maria</option>
          <option value="Cerimoniário">Cerimoniário</option>
          <option value="Coroinha">Coroinha</option>
        </select>
      </label>

      <label>
        Início
        <input
          type="date"
          name="inicio"
          value={inicio || ""}
          onChange={(e) => setInicio(e.target.value)}
        />
      </label>

      <label>
        Local
        <input
          name="local"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Paróquia, comunidade..."
        />
      </label>

      <label>
        Foto (opcional)
        <div className="file-input-wrapper">
          <input
            type="file"
            name="foto"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="file-input-label">
            {photoPreview ? "Alterar foto" : "Selecionar foto"}
          </label>
        </div>
        {photoPreview && (
          <div className="photo-preview">
            <img src={photoPreview} alt="Preview" />
            <button
              type="button"
              className="btn-remove-photo"
              onClick={() => {
                setFile(null);
                setPhotoPreview(editing?.photo || null);
              }}
              aria-label="Remover foto"
            >
              ×
            </button>
          </div>
        )}
      </label>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={uploading}>
          {uploading ? (
            <>
              <span className="spinner"></span>
              Enviando...
            </>
          ) : editing ? (
            "Atualizar"
          ) : (
            "Salvar"
          )}
        </button>
        {editing && (
          <button
            type="button"
            className="btn secondary"
            onClick={handleClear}
            disabled={uploading}
          >
            Cancelar
          </button>
        )}
        {!editing && (
          <button
            type="button"
            className="btn secondary"
            onClick={handleClear}
            disabled={uploading}
          >
            Limpar
          </button>
        )}
      </div>
    </form>
  );
}
