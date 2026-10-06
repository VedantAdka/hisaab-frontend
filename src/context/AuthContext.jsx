import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../api/auth";
import { getMe } from "../api/users";

const AuthContext = createContext(null);

// AuthController returns plain-string bodies for its own checks (e.g.
// "Email already registered"), and Spring Boot's default error body
// ({ error, message, ... }) for anything else (bad credentials, bean
// validation). Handle both shapes rather than assuming one.
function extractErrorMessage(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message && data.message !== "No message available") return data.message;
  if (data?.error) return data.error;
  return fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("hisaab_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("hisaab_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem("hisaab_token", token);
    else localStorage.removeItem("hisaab_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("hisaab_user", JSON.stringify(user));
    else localStorage.removeItem("hisaab_user");
  }, [user]);

  // AuthResponse only carries { token, name, email } — it doesn't include
  // phoneNumber or upiId. Fetch the full profile right after auth (and once
  // on load, if we already have a token from a previous session) so the rest
  // of the app — e.g. the "add your UPI ID" nudge — has the real picture.
  async function refreshUser() {
    try {
      const me = await getMe();
      setUser((prev) => ({ ...prev, ...me }));
      return me;
    } catch {
      // Non-fatal: the app still works with whatever we already have.
      return null;
    }
  }

  useEffect(() => {
    if (token && !user?.upiId && user?.upiId !== null) {
      // We have a token but haven't confirmed the full profile yet
      // (upiId is undefined rather than known-null/known-string).
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function applyAuthResult(data) {
    const { token: newToken, ...userFields } = data;
    setToken(newToken);
    setUser(userFields);
  }

  async function login(credentials) {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(credentials);
      applyAuthResult(data);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't log in. Check your email and password."));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function register(details) {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(details);
      applyAuthResult(data);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't create your account."));
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout, setUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
