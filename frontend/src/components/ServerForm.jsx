import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import { uploadService } from "../services/uploadService";
import { toCalendarDateString } from "../utils/dateOnly";
import { maskPhoneBR, isValidBrPhoneMasked } from "../utils/phoneMask";
import { entityId } from "../utils/servidorSelfVerify";

const DEFAULT_STATUS = "Ativo";

function getInitials(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "SA";
  const parts = trimmed.split(" ").filter(Boolean);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "");
}

export default function ServerForm({ editing, onSaved, onCancel, toast, selfEditVerification = null }) {
  const { canEdit } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    funcao: "",
    inicio: "",
    local: "",
    telefone: "",
    nascimento: "",
    comunidade: "",
    status: DEFAULT_STATUS,
    observacoes: "",
  });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editing) {
      setFormData({
        name: editing.name || "",
        funcao: editing.funcao || "",
        inicio: editing.inicio ? toCalendarDateString(editing.inicio) : "",
        local: editing.local || "",
        telefone: editing.telefone || "",
        nascimento: editing.nascimento ? toCalendarDateString(editing.nascimento) : "",
        comunidade: editing.comunidade || "",
        status: editing.status || DEFAULT_STATUS,
        observacoes: editing.observacoes || "",
      });
      setPhotoPreview(editing.photo || null);
      setFile(null);
      setErrors({});
    } else {
      setFormData({
        name: "",
        funcao: "",
        inicio: "",
        local: "",
        telefone: "",
        nascimento: "",
        comunidade: "",
        status: DEFAULT_STATUS,
        observacoes: "",
      });
      setFile(null);
      setPhotoPreview(null);
      setErrors({});
    }
  }, [editing]);

  const isSelfEdit = Boolean(
    selfEditVerification?.servidorId &&
      editing &&
      entityId(editing) === String(selfEditVerification.servidorId)
  );

  const formEnabled = canEdit || isSelfEdit;

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

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

  function resetFormState() {
    setFormData({
      name: "",
      funcao: "",
      inicio: "",
      local: "",
      telefone: "",
      nascimento: "",
      comunidade: "",
      status: DEFAULT_STATUS,
      observacoes: "",
    });
    setFile(null);
    setPhotoPreview(null);
    setErrors({});
  }

  function handleAfterSave() {
    resetFormState();
    if (onSaved) onSaved();
  }

  function handleCancelClose() {
    resetFormState();
    if (onCancel) onCancel();
  }

  function handleLimparCampos() {
    resetFormState();
  }

  function validate() {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = "Nome é obrigatório";
    }
    if (formData.telefone && !isValidBrPhoneMasked(formData.telefone)) {
      nextErrors.telefone = "Informe um telefone válido (10 ou 11 dígitos)";
    }
    if (
      formData.nascimento &&
      formData.inicio &&
      formData.nascimento > formData.inicio
    ) {
      nextErrors.inicio = "Data de início não pode ser antes do nascimento";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formEnabled) {
      toast?.error("Faça login como editor ou use “Atualizar meu cadastro” para alterar seus dados.");
      return;
    }

    if (!validate()) {
      toast?.error("Corrija os campos destacados para continuar");
      return;
    }

    try {
      setUploading(true);
      let photo = editing?.photo || null;

      if (file) {
        photo = await uploadService.uploadImage(file);
      }

      const userData = {
        name: isSelfEdit ? String(editing.name || "").trim() : formData.name.trim(),
        photo,
        funcao: formData.funcao.trim() || null,
        inicio: formData.inicio ? formData.inicio : null,
        local: formData.local.trim() || null,
        telefone: formData.telefone.trim() || null,
        nascimento: formData.nascimento ? formData.nascimento : null,
        comunidade: formData.comunidade.trim() || null,
        status: formData.status || DEFAULT_STATUS,
        observacoes: formData.observacoes.trim() || null,
        createdAt: editing?.createdAt || new Date().toISOString(),
      };

      const editId = editing?._id || editing?.id;
      if (editId) {
        if (isSelfEdit) {
          await storageService.updateUser(editId, userData, {
            selfEdit: true,
            telefoneUltimos4: selfEditVerification.telefoneUltimos4,
            verificacaoNascimento: selfEditVerification.verificacaoNascimento,
          });
        } else {
          await storageService.updateUser(editId, userData);
        }
        toast?.success("Servidor atualizado com sucesso!");
      } else {
        await storageService.createUser(userData);
        toast?.success("Servidor cadastrado com sucesso!");
      }

      handleAfterSave();
      setUploading(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast?.error("Erro ao salvar: " + (err.message || "Tente novamente"));
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <fieldset className="server-form-fieldset" disabled={!formEnabled}>
      {isSelfEdit && (
        <p className="muted small-hint server-form-self-hint">
          Você está editando seu próprio cadastro. O <strong>nome completo</strong> não pode ser alterado aqui. A foto
          é opcional. Para apagar o cadastro, fale com um editor.
        </p>
      )}
      <div className="form-grid">
        <label className={errors.name ? "field-error" : ""}>
          Nome completo *
          <input
            required
            name="name"
            value={formData.name}
            readOnly={isSelfEdit}
            aria-readonly={isSelfEdit || undefined}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Ex: João Pedro da Silva"
          />
          {errors.name && <small>{errors.name}</small>}
        </label>

        <label>
          Função
          <select
            name="funcao"
            value={formData.funcao}
            onChange={(e) => updateField("funcao", e.target.value)}
          >
            <option value="">Selecione a função</option>
            <option value="Acólito">Acólito</option>
            <option value="Filhas de Maria">Filhas de Maria</option>
            <option value="Cerimoniário">Cerimoniário</option>
            <option value="Coroinha">Coroinha</option>
          </select>
        </label>

        <label className={errors.telefone ? "field-error" : ""}>
          Telefone
          <input
            name="telefone"
            inputMode="tel"
            autoComplete="tel"
            value={formData.telefone}
            onChange={(e) => updateField("telefone", maskPhoneBR(e.target.value))}
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && <small>{errors.telefone}</small>}
        </label>

        <label>
          Status
          <select
            name="status"
            value={formData.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="Ativo">Ativo</option>
            <option value="Em formação">Em formação</option>
            <option value="Inativo">Inativo</option>
          </select>
        </label>

        <label>
          Data de nascimento
          <input
            type="date"
            name="nascimento"
            value={formData.nascimento || ""}
            onChange={(e) => updateField("nascimento", e.target.value)}
          />
        </label>

        <label className={errors.inicio ? "field-error" : ""}>
          Data de início no altar
          <input
            type="date"
            name="inicio"
            value={formData.inicio || ""}
            onChange={(e) => updateField("inicio", e.target.value)}
          />
          {errors.inicio && <small>{errors.inicio}</small>}
        </label>

        <label>
          Local de serviço
          <input
            name="local"
            value={formData.local}
            onChange={(e) => updateField("local", e.target.value)}
            placeholder="Matriz, Capela..."
          />
        </label>

        <label>
          Comunidade/Paróquia
          <input
            name="comunidade"
            value={formData.comunidade}
            onChange={(e) => updateField("comunidade", e.target.value)}
            placeholder="Ex: Comunidade São José"
          />
        </label>

        <label className="full-width">
          Observações
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={(e) => updateField("observacoes", e.target.value)}
            placeholder="Informações importantes sobre disponibilidade, formação ou acompanhamento."
          />
        </label>
      </div>

      <label className="full-width">
        Foto do servidor (opcional)
        <div className="photo-upload-area">
          <div className="photo-preview-card">
            {photoPreview ? (
              <img src={photoPreview} alt="Pré-visualização do servidor" />
            ) : (
              <div className="avatar-fallback">{getInitials(formData.name).toUpperCase()}</div>
            )}
          </div>
          <div className="photo-upload-controls">
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
            <p>Formatos aceitos: JPG, PNG ou WEBP com tamanho de ate 5MB.</p>
            {photoPreview && (
              <button
                type="button"
                className="btn-remove-link"
                onClick={() => {
                  setFile(null);
                  setPhotoPreview(editing?.photo || null);
                }}
                aria-label="Remover foto selecionada"
              >
                Remover foto
              </button>
            )}
          </div>
        </div>
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? (
            <>
              <span className="spinner"></span>
              Salvando...
            </>
          ) : editing ? (
            "Atualizar servidor"
          ) : (
            "Cadastrar servidor"
          )}
        </button>
        {editing && (
          <button
            type="button"
            className="btn secondary"
            onClick={handleCancelClose}
            disabled={uploading}
          >
            Cancelar
          </button>
        )}
        {!editing && (
          <button
            type="button"
            className="btn secondary"
            onClick={handleLimparCampos}
            disabled={uploading}
          >
            Limpar
          </button>
        )}
      </div>
      </fieldset>
    </form>
  );
}
