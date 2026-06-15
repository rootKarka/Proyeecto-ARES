import { API } from "../../config/api";
const API_URL = API.misiones;

export const getMisiones = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener misiones");
  return res.json();
};

export const createMision = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear misión");
  return res.json();
};

export const updateMision = async (id, data) => {
  const res = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar misión");
  return res.json();
};

export const deleteMision = async (id) => {
  const res = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar misión");
};