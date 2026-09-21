"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

type User = { id: number; name: string; email: string; role: "customer" | "admin" };
type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { throw new Error("not ready"); },
  register: async () => { throw new Error("not ready"); },
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lumine_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("lumine_token", data.token);
    localStorage.setItem("lumine_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user as User;
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("lumine_token", data.token);
    localStorage.setItem("lumine_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user as User;
  }

  function logout() {
    localStorage.removeItem("lumine_token");
    localStorage.removeItem("lumine_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
