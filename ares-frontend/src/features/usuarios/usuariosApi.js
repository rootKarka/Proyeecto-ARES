import { API } from "../../config/api";
const API_URL = API.usuarios;

export const getUsuarios = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
};

// Solo operadores activos — para el selector de misiones
export const getOperadores = async () => {
  const res = await fetch(`${API_URL}operadores/`);
  if (!res.ok) throw new Error("Error al obtener operadores");
  return res.json();
};

export const createUsuario = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear usuario");
  return res.json();
};

export const updateUsuario = async (id, data) => {
  const res = await fetch(`${API_URL}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar usuario");
  return res.json();
};

export const deleteUsuario = async (id) => {
  const res = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar usuario");
};