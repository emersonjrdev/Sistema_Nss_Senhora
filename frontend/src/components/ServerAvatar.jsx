import React from "react";

function getInitials(name) {
  const parts = (name || "").split(" ").filter(Boolean);
  if (!parts.length) return "SA";
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase();
}

function DefaultAvatarIcon() {
  return (
    <svg
      className="thumb-frame__icon"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="32" cy="24" r="12" fill="currentColor" opacity="0.22" />
      <path
        d="M16 52c0-8.837 7.163-16 16-16s16 7.163 16 16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

/**
 * @param {{ photo?: string | null, name?: string, variant?: 'list' | 'modal', onPhotoClick?: () => void }} props
 */
export default function ServerAvatar({ photo, name, variant = "list", onPhotoClick }) {
  const frameClass =
    variant === "modal"
      ? "thumb-frame thumb-frame--modal"
      : "thumb-frame thumb-frame--list";

  const img = photo ? (
    <img
      src={photo}
      alt={name ? `Foto de ${name}` : "Foto do servidor"}
      loading="lazy"
      decoding="async"
    />
  ) : null;

  if (photo) {
    if (onPhotoClick) {
      return (
        <button
          type="button"
          className={`${frameClass} thumb-frame--clickable`}
          onClick={onPhotoClick}
          title="Ver foto em tamanho maior"
          aria-label="Ver foto em tamanho maior"
        >
          {img}
        </button>
      );
    }
    return <div className={frameClass}>{img}</div>;
  }

  const initials = getInitials(name);

  return (
    <div className={`${frameClass} thumb-frame--placeholder`} aria-label="Sem foto cadastrada">
      <DefaultAvatarIcon />
      <span className="thumb-frame__initials">{initials}</span>
    </div>
  );
}

export { getInitials as getAvatarInitials };
