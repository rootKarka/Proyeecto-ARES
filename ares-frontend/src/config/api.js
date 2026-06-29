const BASE_URL = "https://proyeecto-ares.onrender.com/api";

export const API = {
  robots:        `${BASE_URL}/robots/`,
  sensores:      `${BASE_URL}/sensores/`,
  lecturas:      `${BASE_URL}/lecturas/`,
  misiones:      `${BASE_URL}/misiones/`,
  usuarios:      `${BASE_URL}/usuarios/`,
  telemetria:    `${BASE_URL}/telemetria/`,
  alertas:       `${BASE_URL}/alertas/`,
  reportesAct:   `${BASE_URL}/reportes/actualizacion/`,
  reportesFinal: `${BASE_URL}/reportes/final/`,
  mensajes:      `${BASE_URL}/mensajes/`,
  evidencias:    `${BASE_URL}/evidencias/`,   // ← nuevo
  bitacora:      `${BASE_URL}/bitacora/`,     // ← nuevo
};

export function withSede(url, sede) {
  if (!sede) return url;
  return `${url}?sede=${encodeURIComponent(sede)}`;
}