import { API, withSede } from "../../config/api";
const API_URL = API.mensajes;

export const getMensajes = async (sede = null) => {
  const res = await fetch(withSede(API_URL, sede));
  if (!res.ok) throw new Error("Error al obtener mensajes");
  return res.json();
};

export const createMensaje = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al enviar mensaje");
  return res.json();
};