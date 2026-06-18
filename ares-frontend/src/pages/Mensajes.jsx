import { useState, useEffect, useCallback } from "react";
import { Send, Loader2, AlertTriangle, RefreshCw, MessageSquare, CheckCheck, Clock } from "lucide-react";
import { getMensajes, createMensaje } from "../features/mensajes/mensajesApi";
import { getUsuarios } from "../features/usuarios/usuariosApi";
import { getMisiones } from "../features/misiones/misionesApi";
import { useAuth } from "../context/AuthContext";
import { buildErrors, isRequired, sanitizeText } from "../utils/validators";

const TIPO_CHOICES     = ["INSTRUCCION", "EVACUACION", "INFORMATIVO", "CRITICO_AUTO"];
const PRIORIDAD_CONFIG = {
  NORMAL:  { bg: "bg-gray-500/10",   text: "text-gray-600 dark:text-gray-400"     },
  URGENTE: { bg: "bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400" },
  CRITICO: { bg: "bg-red-500/10",    text: "text-red-700 dark:text-red-400"       },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
};

export default function Mensajes() {
  const { user } = useAuth();
  const sede = user?.sede;

  const [mensajes, setMensajes]   = useState([]);
  const [usuarios, setUsuarios]   = useState([]);
  const [misiones, setMisiones]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [errors, setErrors]       = useState({});
  const [form, setForm] = useState({
    destinatario: "", mision: "", tipo: "INSTRUCCION",
    contenido: "", prioridad: "NORMAL",
  });

  const fetchData = useCallback(async () => {
    try {
      setFetchError(false);
      setLoading(true);
      const [msgs, users, misions] = await Promise.all([
        getMensajes(sede),
        getUsuarios(sede),
        getMisiones(sede),
      ]);
      setMensajes(msgs);
      // Solo operadores como posibles destinatarios
      setUsuarios(users.filter(u => u.rol === "OPERADOR"));
      setMisiones(misions);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [sede]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(er => ({ ...er, [key]: undefined }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const errs = buildErrors({
      destinatario: [{ check: isRequired(String(form.destinatario)), message: "Selecciona un destinatario." }],
      mision:       [{ check: isRequired(String(form.mision)),       message: "Selecciona una misión."      }],
      contenido:    [{ check: isRequired(form.contenido),            message: "El mensaje no puede estar vacío." }],
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSending(true);
    try {
      await createMensaje({
        destinatario: Number(form.destinatario),
        mision:       Number(form.mision),
        tipo:         form.tipo,
        contenido:    sanitizeText(form.contenido),
        prioridad:    form.prioridad,
        remitente:    null, // el backend lo asigna según sesión
      });
      setForm({ destinatario: "", mision: "", tipo: "INSTRUCCION", contenido: "", prioridad: "NORMAL" });
      await fetchData();
    } catch {
      setErrors({ contenido: "Error al enviar el mensaje." });
    } finally {
      setSending(false);
    }
  };

  const inputClass = (key) =>
    `w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700/50
     text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
     ${errors[key] ? "border-red-400" : "border-gray-200 dark:border-gray-700/60"}`;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mensajería</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Envía instrucciones o comunicados directamente a los operadores en campo.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Formulario de nuevo mensaje */}
        <div className="xl:col-span-1 bg-white dark:bg-gray-800 shadow-xs rounded-xl
                        border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
            <Send size={16} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Nuevo mensaje</h2>
          </header>
          <form onSubmit={handleSend} className="p-5 space-y-3">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Destinatario (Operador)
              </label>
              <select value={form.destinatario} onChange={e => handleChange("destinatario", e.target.value)}
                className={inputClass("destinatario")}>
                <option value="">-- Seleccionar --</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
              {errors.destinatario && <p className="mt-1 text-xs text-red-500">{errors.destinatario}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Misión</label>
              <select value={form.mision} onChange={e => handleChange("mision", e.target.value)}
                className={inputClass("mision")}>
                <option value="">-- Seleccionar --</option>
                {misiones.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
              {errors.mision && <p className="mt-1 text-xs text-red-500">{errors.mision}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <select value={form.tipo} onChange={e => handleChange("tipo", e.target.value)}
                  className={inputClass("tipo")}>
                  {TIPO_CHOICES.map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                <select value={form.prioridad} onChange={e => handleChange("prioridad", e.target.value)}
                  className={inputClass("prioridad")}>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="CRITICO">Crítico</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
              <textarea value={form.contenido} rows={4}
                onChange={e => handleChange("contenido", e.target.value)}
                placeholder="Escribe las instrucciones para el operador..."
                className={inputClass("contenido")} />
              {errors.contenido && <p className="mt-1 text-xs text-red-500">{errors.contenido}</p>}
            </div>

            <button type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg
                         bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-60">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {sending ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        </div>

        {/* Bandeja de mensajes */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 shadow-xs rounded-xl
                        border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60
                             flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                Mensajes enviados
                <span className="ml-2 text-xs font-normal text-gray-400">({mensajes.length})</span>
              </h2>
            </div>
            <button onClick={fetchData}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
              <RefreshCw size={14} />
            </button>
          </header>

          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="text-blue-600 animate-spin" size={28} />
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <AlertTriangle size={28} className="text-red-400" />
                <p className="text-sm text-gray-500">Error al cargar mensajes.</p>
              </div>
            ) : mensajes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
                <MessageSquare size={32} />
                <p className="text-sm">No hay mensajes enviados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                  <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="p-3 text-left font-semibold">Destinatario</th>
                      <th className="p-3 text-left font-semibold">Misión</th>
                      <th className="p-3 text-left font-semibold">Tipo</th>
                      <th className="p-3 text-left font-semibold">Prioridad</th>
                      <th className="p-3 text-left font-semibold">Mensaje</th>
                      <th className="p-3 text-left font-semibold">Leído</th>
                      <th className="p-3 text-left font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
                    {mensajes.map((m) => {
                      const prioCfg = PRIORIDAD_CONFIG[m.prioridad] || PRIORIDAD_CONFIG.NORMAL;
                      return (
                        <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="p-3 font-medium text-gray-800 dark:text-gray-100">
                            {m.destinatario_nombre ?? `#${m.destinatario}`}
                          </td>
                          <td className="p-3 text-gray-500 dark:text-gray-400 text-xs">
                            {m.mision ? `Misión #${m.mision}` : "—"}
                          </td>
                          <td className="p-3 text-gray-500 dark:text-gray-400 text-xs">
                            {m.tipo.replace(/_/g, " ")}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${prioCfg.bg} ${prioCfg.text}`}>
                              {m.prioridad}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {m.contenido}
                          </td>
                          <td className="p-3">
                            {m.leido
                              ? <CheckCheck size={15} className="text-green-500" />
                              : <Clock size={15} className="text-gray-400" />}
                          </td>
                          <td className="p-3 text-gray-400 text-xs whitespace-nowrap">
                            {formatDate(m.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}