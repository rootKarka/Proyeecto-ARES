import { API } from "../../config/api";

export const getReportesActualizacion = async (misionId = null) => {
  const url = misionId
    ? `${API.reportesAct}mision/${misionId}/`
    : API.reportesAct;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener reportes de actualización");
  return res.json();
};

export const getReportesFinales = async () => {
  const res = await fetch(API.reportesFinal);
  if (!res.ok) throw new Error("Error al obtener reportes finales");
  return res.json();
};