import { API, withSede } from "../../config/api";

export const getReportesActualizacion = async (misionId = null, sede = null) => {
  const url = misionId
    ? `${API.reportesAct}mision/${misionId}/`
    : API.reportesAct;
  const res = await fetch(withSede(url, sede));
  if (!res.ok) throw new Error("Error al obtener reportes de actualización");
  return res.json();
};

export const getReportesFinales = async (sede = null) => {
  const res = await fetch(withSede(API.reportesFinal, sede));
  if (!res.ok) throw new Error("Error al obtener reportes finales");
  return res.json();
};