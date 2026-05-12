import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as auth from "../services/authService";
import { onEditorAuthRequired } from "../services/authEvents";
import EditorLoginModal from "../components/EditorLoginModal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState({ checked: false, editorAuthRequired: false });
  const [tick, setTick] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    auth.fetchAuthStatus().then((s) => {
      setStatus({ checked: true, editorAuthRequired: s.editorAuthRequired });
    });
  }, []);

  useEffect(() => {
    return onEditorAuthRequired(() => {
      setStatus((prev) => ({ ...prev, checked: true, editorAuthRequired: true }));
      setLoginOpen(true);
    });
  }, []);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const login = useCallback(
    async (password) => {
      await auth.loginEditor(password);
      setLoginOpen(false);
      refresh();
    },
    [refresh]
  );

  const logout = useCallback(() => {
    auth.logoutEditor();
    refresh();
  }, [refresh]);

  const value = useMemo(() => {
    const authReady = status.checked;
    const editorAuthRequired = status.editorAuthRequired;
    const canEdit = !authReady || auth.canEditNow(editorAuthRequired);
    return {
      authReady,
      editorAuthRequired,
      canEdit,
      openLogin,
      closeLogin,
      loginOpen,
      login,
      logout,
    };
  }, [status.checked, status.editorAuthRequired, tick, loginOpen, openLogin, closeLogin, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <EditorLoginModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
