import { useState } from "react";
import { Loader2, Check } from "lucide-react";

const TIPO_CHOICES = [
  { value: "GAS", label: "Gas" },
  { value: "TEMPERATURA", label: "Temperatura" },
  { value: "SONIDO", label: "Sonido" },
  { value: "ULTRASONICO", label: "Ultrasónico" },
  { value: "INFRARROJO", label: "Infrarrojo" },
  { value: "IMU", label: "IMU / Acelerómetro" },
  { value: "GPS", label: "GPS" },
];

export default function SensorForm({ initial, robots, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? { 
          tipo: initial.tipo, 
          modelo: initial.modelo || "",
          unidad: initial.unidad, 
          robot: initial.robot,
          umbral_critico: initial.umbral_critico || "",
          calibracion_offset: initial.calibracion_offset ?? 0.0,
          activo: initial.activo ?? true
        }
      : { 
          tipo: TIPO_CHOICES[0].value, 
          modelo: "",
          unidad: "", 
          robot: robots[0]?.id || "",
          umbral_critico: "",
          calibracion_offset: 0.0,
          activo: true
        }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.tipo) e.tipo = "El tipo es requerido.";
    if (!form.modelo.trim()) e.modelo = "El modelo es requerido.";
    if (!form.unidad.trim()) e.unidad = "La unidad es requerida.";
    if (!form.robot) e.robot = "Debes seleccionar un robot.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    
    // Parseamos los números antes de enviar al backend
    const payload = {
      ...form,
      robot: Number(form.robot),
      umbral_critico: form.umbral_critico ? parseFloat(form.umbral_critico) : null,
      calibracion_offset: parseFloat(form.calibracion_offset) || 0.0,
    };
    onSubmit(payload);
  };

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(er => ({ ...er, [key]: undefined }));
  };

  const inputClass = (key) =>
    `w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      errors[key] ? "border-red-400" : "border-gray-200 dark:border-gray-700/60"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Robot */}
        <div className="sm:col-span-2">
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

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Sensor</label>
          <select
            value={form.tipo}
            onChange={e => handleChange("tipo", e.target.value)}
            className={inputClass("tipo")}
          >
            {TIPO_CHOICES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.tipo && <p className="mt-1 text-xs text-red-500">{errors.tipo}</p>}
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo (Ej. DHT22)</label>
          <input
            type="text"
            value={form.modelo}
            onChange={e => handleChange("modelo", e.target.value)}
            className={inputClass("modelo")}
          />
          {errors.modelo && <p className="mt-1 text-xs text-red-500">{errors.modelo}</p>}
        </div>

        {/* Unidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidad (Ej. °C, ppm)</label>
          <input
            type="text"
            value={form.unidad}
            onChange={e => handleChange("unidad", e.target.value)}
            className={inputClass("unidad")}
          />
          {errors.unidad && <p className="mt-1 text-xs text-red-500">{errors.unidad}</p>}
        </div>

        {/* Umbral Crítico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Umbral de Alerta (Opcional)</label>
          <input
            type="number"
            step="0.01"
            value={form.umbral_critico}
            onChange={e => handleChange("umbral_critico", e.target.value)}
            placeholder="Límite máximo/mínimo"
            className={inputClass("umbral_critico")}
          />
        </div>

        {/* Calibración / Offset */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offset Calibración</label>
          <input
            type="number"
            step="0.01"
            value={form.calibracion_offset}
            onChange={e => handleChange("calibracion_offset", e.target.value)}
            className={inputClass("calibracion_offset")}
          />
        </div>

        {/* Activo (Checkbox) */}
        <div className="flex items-center mt-6">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.activo}
                onChange={e => handleChange("activo", e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${form.activo ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.activo ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Sensor {form.activo ? 'Activo' : 'Inactivo'}
            </span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60 mt-4">
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
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {initial ? "Guardar cambios" : "Crear sensor"}
        </button>
      </div>
    </form>
  );
}