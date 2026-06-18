import { useState, useEffect, useCallback } from "react";
import { FileText, ClipboardList, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { getReportesActualizacion, getReportesFinales } from "../features/reportes/reportesApi";
import { useAuth } from "../context/AuthContext";

const NIVEL_CONFIG = {
  NORMAL:      { bg: "bg-gray-500/10",   text: "text-gray-700 dark:text-gray-400"     },
  PRECAUCION:  { bg: "bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400" },
  ALTO_RIESGO: { bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400" },
  CRITICO:     { bg: "bg-red-500/10",    text: "text-red-700 dark:text-red-400"       },
};

const ESTADO_GEN_CONFIG = {
  GENERANDO: { bg: "bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400" },
  LISTO:     { bg: "bg-green-500/10",  text: "text-green-700 dark:text-green-400"   },
  ERROR:     { bg: "bg-red-500/10",    text: "text-red-700 dark:text-red-400"       },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
};

// ── Tab: Reportes de Actualización ────────────────────────────
function TabActualizaciones({ sede }) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(false);
      setLoading(true);
      setReportes(await getReportesActualizacion(null, sede));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [sede]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="text-blue-600 animate-spin" size={30} />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <AlertTriangle size={32} className="text-red-400" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Error al cargar reportes.</p>
      <button onClick={fetchData}
        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <RefreshCw size={12} /> Reintentar
      </button>
    </div>
  );

  if (reportes.length === 0) return (
    <div className="flex items-center justify-center h-48">
      <p className="text-sm text-gray-400 dark:text-gray-500">No hay reportes de actualización.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm">
        <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="p-4 text-left font-semibold">Misión</th>
            <th className="p-4 text-left font-semibold">Nivel de riesgo</th>
            <th className="p-4 text-left font-semibold">Resumen</th>
            <th className="p-4 text-left font-semibold">Víctimas</th>
            <th className="p-4 text-left font-semibold">Autor</th>
            <th className="p-4 text-left font-semibold">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
          {reportes.map((r) => {
            const cfg = NIVEL_CONFIG[r.nivel_riesgo] || NIVEL_CONFIG.NORMAL;
            return (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="p-4 font-medium text-gray-800 dark:text-gray-100">
                  {r.mision_nombre ?? `Misión #${r.mision}`}
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                    {r.nivel_riesgo.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{r.resumen}</td>
                <td className="p-4">
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✓ {r.victimas_rescatadas}
                    </span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      ⚠ {r.victimas_heridas}
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      ✕ {r.victimas_fallecidas}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400">
                  {r.autor_nombre ?? `#${r.autor}`}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(r.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab: Reportes Finales ──────────────────────────────────────
function TabFinales({ sede }) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(false);
      setLoading(true);
      setReportes(await getReportesFinales(sede));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [sede]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="text-blue-600 animate-spin" size={30} />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <AlertTriangle size={32} className="text-red-400" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Error al cargar reportes finales.</p>
      <button onClick={fetchData}
        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <RefreshCw size={12} /> Reintentar
      </button>
    </div>
  );

  if (reportes.length === 0) return (
    <div className="flex items-center justify-center h-48">
      <p className="text-sm text-gray-400 dark:text-gray-500">No hay reportes finales aún.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm">
        <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="p-4 text-left font-semibold">Misión</th>
            <th className="p-4 text-left font-semibold">Estado</th>
            <th className="p-4 text-left font-semibold">Duración</th>
            <th className="p-4 text-left font-semibold">Víctimas</th>
            <th className="p-4 text-left font-semibold">Alertas críticas</th>
            <th className="p-4 text-left font-semibold">PDF</th>
            <th className="p-4 text-left font-semibold">Generado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
          {reportes.map((r) => {
            const cfg = ESTADO_GEN_CONFIG[r.estado_generacion] || ESTADO_GEN_CONFIG.GENERANDO;
            return (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="p-4 font-medium text-gray-800 dark:text-gray-100">
                  {r.mision_nombre ?? `Misión #${r.mision}`}
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                    {r.estado_generacion}
                  </span>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{r.duracion_minutos} min</td>
                <td className="p-4">
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✓ {r.victimas_rescatadas}
                    </span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      ⚠ {r.victimas_heridas}
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      ✕ {r.victimas_fallecidas}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-bold text-red-600 dark:text-red-400">{r.alertas_criticas}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">
                    / {r.total_alertas} total
                  </span>
                </td>
                <td className="p-4">
                  {r.url_pdf ? (
                    <a href={`http://localhost:8000${r.url_pdf}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      <FileText size={13} /> Descargar
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(r.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────
export default function Reportes() {
  const { user } = useAuth();
  const sede = user?.sede;

  const [tab, setTab] = useState("actualizacion"); // "actualizacion" | "final"

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Reportes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Reportes de actualización enviados en campo y reportes finales de misión.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-700/60">
          <button
            onClick={() => setTab("actualizacion")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2
              ${tab === "actualizacion"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-500/5"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            <ClipboardList size={16} />
            Reportes de Actualización
          </button>
          <button
            onClick={() => setTab("final")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2
              ${tab === "final"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-500/5"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            <FileText size={16} />
            Reportes Finales
          </button>
        </div>

        <div className="p-2">
          {tab === "actualizacion" ? <TabActualizaciones sede={sede} /> : <TabFinales sede={sede} />}
        </div>
      </div>
    </div>
  );
}