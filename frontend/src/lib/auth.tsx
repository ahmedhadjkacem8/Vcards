import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  // ajoute d'autres champs si nécessaire
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // Vérifie session existante
  const fetchSession = async () => {
    setLoading(true);
    try {
      // If a token is stored in localStorage, use it. Otherwise fall back to cookie-based session.
      const token = localStorage.getItem("token");
      const res = token
        ? await fetch(`${API_URL}/auth/session`, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          })
        : await fetch(`${API_URL}/auth/session`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else if (res.status === 401 && token) {
        // If token failed, clear it and retry session fetch without token (rely on cookies)
        localStorage.removeItem("token");
        await fetchSession(); // Recursive call to retry without the bad token
        return;
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch session", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      // If backend returns a token, persist it for subsequent protected requests
      if (data.token) localStorage.setItem("token", data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      // Clear stored token when logging out
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
