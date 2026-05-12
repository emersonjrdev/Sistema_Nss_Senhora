/** Permite que apiRequest solicite login quando a API responder 401 de edição. */
const listeners = new Set();

export function onEditorAuthRequired(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function emitEditorAuthRequired() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      /* ignore */
    }
  });
}
