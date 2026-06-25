import { createContext, useContext, useState, useEffect } from "react";

import { API } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ares_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("ares_user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch(API.usuarios);
    if (!res.ok) throw new Error("No se pudo conectar al servidor.");
    const usuarios = await res.json();

    const found = usuarios.find(
      (u) => u.email === email.trim().toLowerCase()
    );

    if (!found)                throw new Error("Credenciales incorrectas.");
    if (!found.activo)         throw new Error("Tu cuenta está desactivada.");
    if (found.rol !== "ADMIN") throw new Error("No tienes permiso para acceder al panel de administración.");

    localStorage.removeItem("ares_user");

    const sessionUser = {
      id:     found.id,
      nombre: found.nombre,
      email:  found.email,
      rol:    found.rol,
      sede:   found.sede,   // ← NUEVO
    };

    localStorage.setItem("ares_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem("ares_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}