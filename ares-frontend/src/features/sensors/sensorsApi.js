const API_SENSORES = "http://localhost:8000/api/sensores/";
const API_ROBOTS   = "http://localhost:8000/api/robots/";

export const getSensores = async () => {
  const res = await fetch(API_SENSORES);
  if (!res.ok) throw new Error("Error al obtener sensores");
  return res.json();
};

export const getRobots = async () => {
  const res = await fetch(API_ROBOTS);
  if (!res.ok) throw new Error("Error al obtener robots");
  return res.json();
};

export const createSensor = async (data) => {
  const res = await fetch(API_SENSORES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear sensor");
  return res.json();
};

export const updateSensor = async (id, data) => {
  const res = await fetch(`${API_SENSORES}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar sensor");
  return res.json();
};

export const deleteSensor = async (id) => {
  const res = await fetch(`${API_SENSORES}${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar sensor");
};