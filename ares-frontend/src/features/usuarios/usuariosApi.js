import { API } from "../../config/api";
const API_URL = API.usuarios;

export const getUsuarios = async (sede = null) => {
  const url = sede ? `${API_URL}?sede=${sede}` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
};

export const getOperadores = async (sede = null) => {
  const url = sede
    ? `${API_URL}operadores/?sede=${sede}`
    : `${API_URL}operadores/`;
  const res = await fetch(url);
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