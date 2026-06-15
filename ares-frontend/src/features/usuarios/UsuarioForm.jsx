import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { buildErrors, isRequired, isValidEmail, minLength, sanitizeText } from "../../utils/validators";

export default function UsuarioForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? { nombre: initial.nombre, email: initial.email, rol: initial.rol,
          telefono: initial.telefono || "", activo: initial.activo, password_hash: "" }
      : { nombre: "", email: "", password_hash: "", rol: "OPERADOR", telefono: "", activo: true }
  );
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(er => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = buildErrors({
      nombre: [
        { check: isRequired(form.nombre),       message: "El nombre es requerido." },
        { check: minLength(form.nombre, 3),      message: "Mínimo 3 caracteres." },
      ],
      email: [
        { check: isRequired(form.email),         message: "El email es requerido." },
        { check: isValidEmail(form.email),        message: "Email no válido." },
      ],
      // La contraseña solo es obligatoria al crear
      ...(!initial && {
        password_hash: [
          { check: isRequired(form.password_hash),     message: "La contraseña es requerida." },
          { check: minLength(form.password_hash, 6),   message: "Mínimo 6 caracteres." },
        ],
      }),
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      nombre:   sanitizeText(form.nombre),
      email:    form.email.trim().toLowerCase(),
      rol:      form.rol,
      telefono: sanitizeText(form.telefono),
      activo:   form.activo,
    };
    // Solo incluimos password si se escribió algo
    if (form.password_hash) payload.password_hash = form.password_hash;

    onSubmit(payload);
  };

  const inputClass = (key) =>
    `w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700/50
     text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
     ${errors[key] ? "border-red-400" : "border-gray-200 dark:border-gray-700/60"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo</label>
          <input type="text" value={form.nombre}
            onChange={e => handleChange("nombre", e.target.value)}
            className={inputClass("nombre")} />
          {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            className={inputClass("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contraseña {initial && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
          </label>
          <input type="password" value={form.password_hash}
            onChange={e => handleChange("password_hash", e.target.value)}
            placeholder={initial ? "••••••" : ""}
            className={inputClass("password_hash")} />
          {errors.password_hash && <p className="mt-1 text-xs text-red-500">{errors.password_hash}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
          <input type="text" value={form.telefono}
            onChange={e => handleChange("telefono", e.target.value)}
            className={inputClass("telefono")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
          <select value={form.rol} onChange={e => handleChange("rol", e.target.value)}
            className={inputClass("rol")}>
            <option value="OPERADOR">Operador</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={form.activo}
              onChange={e => handleChange("activo", e.target.checked)} className="sr-only peer" />
            <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer
                            peer-checked:bg-blue-500 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow
                            peer-checked:translate-x-4 transition-transform" />
          </label>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {form.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

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
          {initial ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}