import { useState } from "react";
import { Loader2, Check } from "lucide-react";

const ESTADO_CHOICES = ["PENDIENTE", "EN_CURSO", "PAUSADA", "COMPLETADA", "ABORTADA"];
const TIPO_CHOICES = ["DERRUMBE", "INCENDIO", "INUNDACION", "EXPLOSION", "FUGA_GAS", "PERSONA_PERDIDA", "OTRO"];

export default function MisionForm({ initial, onSubmit, onCancel, loading, robotsDisponibles = [] }) {
  const [form, setForm] = useState(
    initial || {
      nombre: "", estado: "PENDIENTE", tipo: "OTRO", zona_nombre: "",
      lat_zona: "", lng_zona: "", robot: "", descripcion: "",
    }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    
    onSubmit({
      ...form,
      lat_zona: form.lat_zona ? Number(form.lat_zona) : 0,
      lng_zona: form.lng_zona ? Number(form.lng_zona) : 0,
      robot: form.robot ? Number(form.robot) : null,
    });
  };

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(er => ({ ...er, [key]: undefined }));
  };

  const inputClass = (key) =>
    `w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[key] ? "border-red-400" : "border-gray-200 dark:border-gray-700/60"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la Misión</label>
          <input type="text" value={form.nombre} onChange={e => handleChange("nombre", e.target.value)} className={inputClass("nombre")} />
          {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select value={form.tipo} onChange={e => handleChange("tipo", e.target.value)} className={inputClass("tipo")}>
            {TIPO_CHOICES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select value={form.estado} onChange={e => handleChange("estado", e.target.value)} className={inputClass("estado")}>
            {ESTADO_CHOICES.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Robot Asignado</label>
          <select value={form.robot || ""} onChange={e => handleChange("robot", e.target.value)} className={inputClass("robot")}>
            <option value="">-- Sin asignar --</option>
            {robotsDisponibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Zona</label>
          <input type="text" value={form.zona_nombre} onChange={e => handleChange("zona_nombre", e.target.value)} className={inputClass("zona_nombre")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Latitud</label>
          <input type="number" step="any" value={form.lat_zona} onChange={e => handleChange("lat_zona", e.target.value)} className={inputClass("lat_zona")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Longitud</label>
          <input type="number" step="any" value={form.lng_zona} onChange={e => handleChange("lng_zona", e.target.value)} className={inputClass("lng_zona")} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea value={form.descripcion} onChange={e => handleChange("descripcion", e.target.value)} rows="2" className={inputClass("descripcion")} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200">Cancelar</button>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Guardar
        </button>
      </div>
    </form>
  );
}