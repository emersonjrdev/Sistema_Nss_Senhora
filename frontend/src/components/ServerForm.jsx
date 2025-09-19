import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { uploadService } from "../services/uploadService";

export default function ServerForm({ editing, onSaved }) {
  const [name, setName] = useState("");
  const [funcao, setFuncao] = useState("");
  const [inicio, setInicio] = useState("");
  const [local, setLocal] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setFuncao(editing.funcao || "");
      setInicio(editing.inicio || "");
      setLocal(editing.local || "");
    } else {
      setName("");
      setFuncao("");
      setInicio("");
      setLocal("");
    }
  }, [editing]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    try {
      setUploading(true);
      let photo = editing?.photo || null;

      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("A imagem deve ter menos de 5MB");
          setUploading(false);
          return;
        }
        photo = await uploadService.uploadImage(file);
      }

      const userData = {
        name: name.trim(),
        photo,
        funcao: funcao.trim(),
        inicio: inicio || null,
        local: local.trim(),
      };

      if (editing?._id) {
        await storageService.updateUser(editing._id, userData);
        alert("Atualizado com sucesso!");
      } else {
        await storageService.createUser(userData);
        alert("Usuário cadastrado!");
      }

      setName("");
      setFuncao("");
      setInicio("");
      setLocal("");
      setFile(null);
      setUploading(false);

      if (onSaved) onSaved();
    } catch (err) {
      console.error("Erro detalhado:", err);
      alert("Erro ao salvar: " + err.message);
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
          <option value="Leitor">Leitor</option>
          <option value="Ministro">Ministro</option>
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
        <input
          type="file"
          name="foto"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit" className="btn" disabled={uploading}>
          {uploading ? "Enviando..." : editing ? "Atualizar" : "Salvar"}
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            setName("");
            setFuncao("");
            setInicio("");
            setLocal("");
            setFile(null);
            if (onSaved) onSaved();
          }}
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
