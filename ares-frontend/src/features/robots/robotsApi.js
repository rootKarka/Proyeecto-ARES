const API_URL = "http://localhost:8000/api/robots/";

export const getRobots = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener robots");
  return res.json();
};

export const createRobot = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear robot");
  return res.json();
};

export const updateRobot = async (id, data) => {
  const res = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar robot");
  return res.json();
};

export const deleteRobot = async (id) => {
  const res = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar robot");
};