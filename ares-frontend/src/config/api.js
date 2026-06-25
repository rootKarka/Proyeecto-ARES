const BASE_URL = "http://10.162.160.51:8000/api";

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
};

export function withSede(url, sede) {
  if (!sede) return url;
  return `${url}?sede=${encodeURIComponent(sede)}`;
}