import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { uploadService } from "../services/uploadService";

export default function ServerForm({ editing, onSaved }) {
  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");
  const [inicio, setInicio] = useState("");
  const [local, setLocal] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editing) {
      setNome(editing.nome || "");
      setFuncao(editing.funcao || "");
      setInicio(editing.inicio || "");
      setLocal(editing.local || "");
    } else {
      setNome("");
      setFuncao("");
      setInicio("");
      setLocal("");
    }
  }, [editing]);


async function handleSubmit(e) {
  e.preventDefault();
  
  // Validação básica
  if (!nome.trim() || !funcao.trim()) {
    alert('Nome e função são obrigatórios');
    return;
  }

  try {
    setUploading(true);
    let photoURL = editing?.photoURL || null;
    
    // Upload da imagem se houver arquivo
    if (file) {
      // Validação do arquivo
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('A imagem deve ter menos de 5MB');
        setUploading(false);
        return;
      }
      
      photoURL = await uploadService.uploadImage(file);
    }

    const serverData = {
      nome: nome.trim(),
      funcao: funcao.trim(),
      inicio: inicio || null,
      local: local.trim(),
      photoURL
    };

    if (editing?.id) {
      serverData.id = editing.id;
    }

    storageService.saveServer(serverData);
    alert(editing ? "Atualizado com sucesso!" : "Servidor cadastrado!");

    // Limpa o formulário
    setNome("");
    setFuncao("");
    setInicio("");
    setLocal("");
    setFile(null);
    setUploading(false);
    
    if (onSaved) onSaved();

  } catch (err) {
    console.error('Erro detalhado:', err);
    alert("Erro ao salvar: " + err.message);
    setUploading(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>Nome
        <input required value={nome} onChange={e => setNome(e.target.value)} />
      </label>

      <label>Função
        <select value={funcao} onChange={e => setFuncao(e.target.value)}>
          <option value="">Selecione a função</option>
          <option value="Acólito">Acólito</option>
          <option value="Leitor">Leitor</option>
          <option value="Ministro">Ministro</option>
          <option value="Coroinha">Coroinha</option>
        </select> setFuncao(e.target.value)} placeholder="Ex: Coroinha, Leitor..." />
      </label>

      <label>Início
        <input type="date" value={inicio || ""} onChange={e => setInicio(e.target.value)} />
      </label>

      <label>Local
        <input value={local} onChange={e => setLocal(e.target.value)} placeholder="Paróquia, comunidade..." />
      </label>

      <label>Foto (opcional)
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
      </label>

      <div style={{display: "flex", gap: 8, marginTop: 8}}>
        <button type="submit" className="btn" disabled={uploading}>
          {uploading ? "Enviando..." : editing ? "Atualizar" : "Salvar"}
        </button>
        <button type="button" className="btn secondary" onClick={() => { 
          setNome(""); setFuncao(""); setInicio(""); setLocal(""); setFile(null); 
          if (onSaved) onSaved(); 
        }}>
          Limpar
        </button>
      </div>
    </form>
  );
}