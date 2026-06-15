// ─────────────────────────────────────────────────────────────
// Validadores y sanitizadores para formularios
// El frontend es la primera línea de defensa:
// nunca enviar datos sin validar al backend.
// ─────────────────────────────────────────────────────────────

// Elimina caracteres peligrosos para evitar XSS básico
export function sanitizeText(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Valida email con regex estándar
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Valida MAC address formato XX:XX:XX:XX:XX:XX
export function isValidMac(mac) {
  return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac);
}

// Valida que un número esté dentro de un rango
export function isInRange(value, min, max) {
  const n = Number(value);
  return !isNaN(n) && n >= min && n <= max;
}

// Valida latitud y longitud
export function isValidLatitud(v)  { return isInRange(v, -90,  90);  }
export function isValidLongitud(v) { return isInRange(v, -180, 180); }

// Valida que un string no esté vacío después de trim
export function isRequired(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Valida longitud mínima
export function minLength(value, min) {
  return typeof value === "string" && value.trim().length >= min;
}

// Construye errores de validación de forma consistente
// Uso: const errors = validate({ nombre: [required], email: [required, email] })
export function buildErrors(rules) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const { check, message } of fieldRules) {
      if (!check) {
        errors[field] = message;
        break; // solo el primer error por campo
      }
    }
  }
  return errors;
}