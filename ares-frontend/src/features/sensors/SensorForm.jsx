import { useState } from "react";
import { Loader2, Check } from "lucide-react";

export default function SensorForm({ initial, robots, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? { tipo: initial.tipo, unidad: initial.unidad, robot: initial.robot }
      : { tipo: "", unidad: "", robot: robots[0]?.id || "" }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.tipo.trim())   e.tipo   = "El tipo es requerido.";
    if (!form.unidad.trim()) e.unidad = "La unidad es requerida.";
    if (!form.robot)         e.robot  = "Debes seleccionar un robot.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit({ ...form, robot: Number(form.robot) });
  };

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(er => ({ ...er, [key]: undefined }));
  };

  // CORRECCIÓN: focus:ring-blue-500
  const inputClass = (key) =>
    `w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      errors[key] ? "border-red-400" : "border-gray-200 dark:border-gray-700/60"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
        <input
          type="text"
          value={form.tipo}
          onChange={e => handleChange("tipo", e.target.value)}
          placeholder="Ej: Temperatura, Gas MQ-2"
          className={inputClass("tipo")}
        />
        {errors.tipo && <p className="mt-1 text-xs text-red-500">{errors.tipo}</p>}
      </div>

      {/* Unidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidad de medida</label>
        <input
          type="text"
          value={form.unidad}
          onChange={e => handleChange("unidad", e.target.value)}
          placeholder="Ej: °C, ppm, %"
          className={inputClass("unidad")}
        />
        {errors.unidad && <p className="mt-1 text-xs text-red-500">{errors.unidad}</p>}
      </div>

      {/* Robot */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Robot asignado</label>
        <select
          value={form.robot}
          onChange={e => handleChange("robot", e.target.value)}
          className={inputClass("robot")}
        >
          {robots.map(r => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
        {errors.robot && <p className="mt-1 text-xs text-red-500">{errors.robot}</p>}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          // CORRECCIÓN: Tonos azules para el botón
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {initial ? "Guardar cambios" : "Crear sensor"}
        </button>
      </div>
    </form>
  );
}