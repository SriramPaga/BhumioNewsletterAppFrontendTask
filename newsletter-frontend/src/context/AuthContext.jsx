import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api.js";

const AuthContext = createContext({});

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const [, payload] = token.split(".");
    if (!payload) return true;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof decoded.exp !== "number" || decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getSavedToken = () => {
  const saved = localStorage.getItem("newsletter_token");
  if (!saved || isTokenExpired(saved)) {
    localStorage.removeItem("newsletter_token");
    localStorage.removeItem("newsletter_user");
    return null;
  }
  return saved;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getSavedToken);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("newsletter_user");
    return stored ? JSON.parse(stored) : null;
  });

  const organizationId = user?.organization?.id || user?.organizationId || null;
  console.log("AuthProvider org:", organizationId);

  const login = useCallback(({ accessToken, user }) => {
    localStorage.setItem("newsletter_token", accessToken);
    localStorage.setItem("newsletter_user", JSON.stringify(user));
    const orgId = user?.organization?.id || user?.organizationId;

    if (orgId) {
      localStorage.setItem("orgId", orgId);
    }
    setToken(accessToken);
    setUser(user);
    api.setAuthToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("newsletter_token");
    localStorage.removeItem("newsletter_user");
    localStorage.removeItem("orgId");
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    if (token) {
      api.setAuthToken(token);
    } else {
      api.setAuthToken(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ token, user, organizationId, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
