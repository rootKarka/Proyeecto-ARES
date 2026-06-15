import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { buildErrors, isRequired, sanitizeText } from "../../utils/validators";

const ESTADO_CHOICES = ["PENDIENTE", "EN_CURSO", "PAUSADA", "COMPLETADA", "ABORTADA"];
const TIPO_CHOICES   = [
  "DERRUMBE", "INCENDIO", "INUNDACION",
  "EXPLOSION", "FUGA_GAS", "PERSONA_PERDIDA", "OTRO"
];

export default function MisionForm({
  initial,
  onSubmit,
  onCancel,
  loading,
  robotsDisponibles = [],
  operadoresDisponibles = [],   // lista de usuarios con rol OPERADOR
  adminId = null,               // id del admin logueado (creado_por)
}) {
  const [form, setForm] = useState(
    initial || {
      nombre: "", estado: "PENDIENTE", tipo: "OTRO",
      zona_nombre: "", lat_zona: "", lng_zona: "",
      robot: "", operador: "", descripcion: "",
      observaciones_admin: "",
    }
  );
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(er => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errs = buildErrors({
      nombre: [{ check: isRequired(form.nombre), message: "El nombre es requerido." }],
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSubmit({
      nombre:               sanitizeText(form.nombre),
      estado:               form.estado,
      tipo:                 form.tipo,
      zona_nombre:          sanitizeText(form.zona_nombre),
      lat_zona:             form.lat_zona  ? Number(form.lat_zona)  : null,
      lng_zona:             form.lng_zona  ? Number(form.lng_zona)  : null,
      robot:                form.robot     ? Number(form.robot)     : null,
      operador:             form.operador  ? Number(form.operador)  : null,
      creado_por:           adminId        ? Number(adminId)        : null,
      descripcion:          sanitizeText(form.descripcion),
      observaciones_admin:  sanitizeText(form.observaciones_admin),
    });
  };

  const inputClass = (key) =>
    `w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700/50
     text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
     ${errors[key] ? "border-red-400" : "border-gray-200 dark:border-gray-700/60"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Nombre + Tipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la Misión</label>
          <input type="text" value={form.nombre}
            onChange={e => handleChange("nombre", e.target.value)}
            className={inputClass("nombre")} />
          {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select value={form.tipo} onChange={e => handleChange("tipo", e.target.value)}
            className={inputClass("tipo")}>
            {TIPO_CHOICES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estado + Robot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select value={form.estado} onChange={e => handleChange("estado", e.target.value)}
            className={inputClass("estado")}>
            {ESTADO_CHOICES.map(e => (
              <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Robot Asignado</label>
          <select value={form.robot || ""} onChange={e => handleChange("robot", e.target.value)}
            className={inputClass("robot")}>
            <option value="">-- Sin asignar --</option>
            {robotsDisponibles.map(r => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Operador asignado */}
      <div>
        <label className="block text-sm font-medium mb-1">Operador Asignado</label>
        <select value={form.operador || ""} onChange={e => handleChange("operador", e.target.value)}
          className={inputClass("operador")}>
          <option value="">-- Sin asignar --</option>
          {operadoresDisponibles.map(u => (
            <option key={u.id} value={u.id}>{u.nombre}</option>
          ))}
        </select>
      </div>

      {/* Zona + Coordenadas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Zona</label>
          <input type="text" value={form.zona_nombre}
            onChange={e => handleChange("zona_nombre", e.target.value)}
            className={inputClass("zona_nombre")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Latitud</label>
          <input type="number" step="any" value={form.lat_zona}
            onChange={e => handleChange("lat_zona", e.target.value)}
            className={inputClass("lat_zona")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Longitud</label>
          <input type="number" step="any" value={form.lng_zona}
            onChange={e => handleChange("lng_zona", e.target.value)}
            className={inputClass("lng_zona")} />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea value={form.descripcion} rows={2}
          onChange={e => handleChange("descripcion", e.target.value)}
          className={inputClass("descripcion")} />
      </div>

      {/* Observaciones admin (solo al editar) */}
      {initial && (
        <div>
          <label className="block text-sm font-medium mb-1">Observaciones del Admin</label>
          <textarea value={form.observaciones_admin} rows={2}
            onChange={e => handleChange("observaciones_admin", e.target.value)}
            className={inputClass("observaciones_admin")} />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700/60
                     text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg
                     bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-60">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {initial ? "Guardar cambios" : "Crear misión"}
        </button>
      </div>
    </form>
  );
}