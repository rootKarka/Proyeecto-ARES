// ─────────────────────────────────────────────────────────────
// Configuración central de la API
// Si cambia la IP o el puerto, solo modifica BASE_URL aquí.
// ─────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8000/api";

export const API = {
  robots:   `${BASE_URL}/robots/`,
  sensores: `${BASE_URL}/sensores/`,
  lecturas: `${BASE_URL}/lecturas/`,
};