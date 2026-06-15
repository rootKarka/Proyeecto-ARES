import { useState } from "react";
import { Loader2, Check } from "lucide-react";

const ESTADO_CHOICES = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "EN_MISION", label: "En misión" },
  { value: "MANTENIMIENTO", label: "En mantenimiento" },
  { value: "AVERIADO", label: "Averiado" },
  { value: "INACTIVO", label: "Inactivo" },
];

export default function RobotForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? { 
          nombre: initial.nombre, 
          mac_address: initial.mac_address, 
          estado: initial.estado, 
          latitud: initial.latitud, 
          longitud: initial.longitud 
        }
      : { 
          nombre: "", 
          mac_address: "", 
          estado: "DISPONIBLE", 
          latitud: "", 
          longitud: "" 
        }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nombre.trim())          e.nombre      = "El nombre es requerido.";
    if (!form.mac_address?.trim())    e.mac_address = "La dirección MAC es requerida.";
    if (form.latitud === "")          e.latitud     = "La latitud es requerida.";
    if (form.longitud === "")         e.longitud    = "La longitud es requerida.";
    if (isNaN(Number(form.latitud)))  e.latitud     = "Debe ser un número válido.";
    if (isNaN(Number(form.longitud))) e.longitud    = "Debe ser un número válido.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit({ ...form, latitud: Number(form.latitud), longitud: Number(form.longitud) });
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

      {/* Nombre y MAC Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={e => handleChange("nombre", e.target.value)}
            placeholder="Ej: Robot Alpha"
            className={inputClass("nombre")}
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MAC Address</label>
          <input
            type="text"
            value={form.mac_address}
            onChange={e => handleChange("mac_address", e.target.value)}
            placeholder="Ej: 00:1A:2B:3C:4D:5E"
            className={inputClass("mac_address")}
            disabled={!!initial}
          />
          {errors.mac_address && <p className="mt-1 text-xs text-red-500">{errors.mac_address}</p>}
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
        <select
          value={form.estado}
          onChange={e => handleChange("estado", e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {ESTADO_CHOICES.map(opcion => (
            <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
          ))}
        </select>
      </div>

      {/* Latitud y Longitud */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitud Inicial</label>
          <input
            type="number"
            step="any"
            value={form.latitud}
            onChange={e => handleChange("latitud", e.target.value)}
            placeholder="Ej: -12.046"
            className={inputClass("latitud")}
          />
          {errors.latitud && <p className="mt-1 text-xs text-red-500">{errors.latitud}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitud Inicial</label>
          <input
            type="number"
            step="any"
            value={form.longitud}
            onChange={e => handleChange("longitud", e.target.value)}
            placeholder="Ej: -77.042"
            className={inputClass("longitud")}
          />
          {errors.longitud && <p className="mt-1 text-xs text-red-500">{errors.longitud}</p>}
        </div>
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
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {initial ? "Guardar cambios" : "Crear robot"}
        </button>
      </div>
    </form>
  );
}