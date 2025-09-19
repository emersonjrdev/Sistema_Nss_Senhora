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

  // 👇 loga variáveis logo no carregamento
  useEffect(() => {
    console.log("🔥 Variáveis no build:", import.meta.env);
    console.log("🌍 API_BASE:", import.meta.env.VITE_API_URL);
    console.log("☁️ CLOUDINARY_URL:", import.meta.env.VITE_CLOUDINARY_URL);
    console.log("☁️ CLOUDINARY_PRESET:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  }, []);

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setFuncao(editing.funcao || "");
      // 👇 força exibir apenas YYYY-MM-DD
      setInicio(editing.inicio ? editing.inicio.split("T")[0] : "");
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
        console.log("📤 Enviando arquivo para Cloudinary:", file.name);
        photo = await uploadService.uploadImage(file);
        console.log("✅ Foto recebida do Cloudinary:", photo);
      }

      const userData = {
        name: name.trim(),
        photo,
        funcao: funcao.trim(),
        // 👇 garante que sempre salva o mesmo dia escolhido
        inicio: inicio ? new Date(inicio + "T00:00:00").toISOString().split("T")[0] : null,
        local: local.trim(),
      };

      console.log("📦 Dados sendo enviados:", userData);

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
      console.error("❌ Erro detalhado:", err);
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
          <option value="Leitor">Filhas de Maria</option>
          <option value="Ministro">Cerimoniário</option>
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
