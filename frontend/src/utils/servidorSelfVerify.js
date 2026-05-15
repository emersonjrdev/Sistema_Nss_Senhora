import { toCalendarDateString } from "./dateOnly";

export function digitsOnly(s) {
  return String(s || "").replace(/\D/g, "");
}

/**
 * Confere identidade do servidor (últimos 4 dígitos do telefone cadastrado
 * ou data de nascimento em YYYY-MM-DD).
 */
export function verifyServidorIdentity(user, { telefoneUltimos4, verificacaoNascimento }) {
  if (!user) return false;
  const t4 = digitsOnly(telefoneUltimos4 || "");
  const phone = digitsOnly(user.telefone || "");
  const okPhone = phone.length >= 4 && t4.length >= 4 && phone.slice(-4) === t4.slice(-4);

  let okBirth = false;
  const b = String(verificacaoNascimento || "").trim();
  if (b && user.nascimento) {
    okBirth = toCalendarDateString(user.nascimento) === b;
  }

  return okPhone || okBirth;
}

export function canVerifyServidor(user) {
  if (!user) return false;
  const phone = digitsOnly(user.telefone || "");
  const hasBirth = Boolean(user.nascimento);
  return phone.length >= 4 || hasBirth;
}
