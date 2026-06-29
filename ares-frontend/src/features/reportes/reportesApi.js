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

// ── NUEVO: datos combinados del Reporte Final ──
export const getEvidenciasPorMision = async (misionId) => {
  const res = await fetch(`${API.evidencias}mision/${misionId}/`);
  if (!res.ok) throw new Error("Error al obtener evidencias");
  return res.json();
};

export const getBitacoraPorMision = async (misionId) => {
  const res = await fetch(`${API.bitacora}mision/${misionId}/`);
  if (!res.ok) throw new Error("Error al obtener bitácora");
  return res.json();
};

// ── NUEVO: URLs de descarga de PDF ──
export const urlPdfActualizacion = (id) => `${API.reportesAct}${id}/pdf/`;
export const urlPdfFinal = (id) => `${API.reportesFinal}${id}/pdf/`;