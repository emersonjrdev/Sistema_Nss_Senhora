import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function PhotoLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="photo-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      onClick={onClose}
    >
      <button
        type="button"
        className="photo-lightbox-close"
        onClick={onClose}
        aria-label="Fechar"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt || "Foto do servidor"}
        className="photo-lightbox-img"
        onClick={(e) => e.stopPropagation()}
        decoding="async"
        fetchPriority="high"
      />
    </div>,
    document.body
  );
}
