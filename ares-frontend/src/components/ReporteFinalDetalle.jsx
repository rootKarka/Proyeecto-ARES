import { useState, useEffect } from "react";
import {
  X, FileDown, MapPin, Battery, Signal, Clock,
  Image as ImageIcon, BookText, Mic, AlertTriangle, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { getEvidenciasPorMision, getBitacoraPorMision, urlPdfFinal } from "../features/reportes/reportesApi";

const TIPO_BITACORA_CONFIG = {
  NOTA:      { color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-500/10"   },
  EVENTO:    { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  DECISION:  { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  HALLAZGO:  { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  INCIDENTE: { color: "text-red-600 dark:text-red-400",     bg: "bg-red-500/10"    },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
};

export default function ReporteFinalDetalle({ reporte, onClose }) {
  const [evidencias, setEvidencias] = useState([]);
  const [bitacora, setBitacora]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(false);
        setLoading(true);
        const [evData, bitData] = await Promise.all([
          getEvidenciasPorMision(reporte.mision),
          getBitacoraPorMision(reporte.mision),
        ]);
        setEvidencias(evData);
        setBitacora(bitData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reporte.mision]);

  const datosGrafico = (reporte.resumen_sensores || []).map(s => ({
    sensor: s.sensor,
    mínimo: s.min,
    promedio: s.promedio,
    máximo: s.max,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between
                        px-6 py-4 border-b border-gray-100 dark:border-gray-800 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {reporte.mision_nombre ?? `Misión #${reporte.mision}`}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Reporte final generado el {formatDate(reporte.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            
            {/* 👇 AQUÍ YA ESTÁ CORREGIDO EL "<a" QUE FALTABA */}
            <a 
              href={urlPdfFinal(reporte.id)}
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <FileDown size={13} /> Descargar PDF
            </a>

            <button onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Stat cards resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
              <p className="text-[10px] uppercase text-gray-400 tracking-wide flex items-center gap-1">
                <Clock size={11} /> Duración
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{reporte.duracion_minutos} min</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
              <p className="text-[10px] uppercase text-gray-400 tracking-wide flex items-center gap-1">
                <Battery size={11} /> Batería usada
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {reporte.bateria_inicio}% → {reporte.bateria_fin}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
              <p className="text-[10px] uppercase text-gray-400 tracking-wide flex items-center gap-1">
                <MapPin size={11} /> Distancia
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {reporte.distancia_recorrida_m?.toFixed(0)} m
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
              <p className="text-[10px] uppercase text-gray-400 tracking-wide flex items-center gap-1">
                <Signal size={11} /> Señal prom.
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {reporte.promedio_senal_rssi?.toFixed(0)} dBm
              </p>
            </div>
          </div>

          {/* Víctimas */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-emerald-500/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{reporte.victimas_rescatadas}</p>
              <p className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400">Rescatadas</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{reporte.victimas_heridas}</p>
              <p className="text-[10px] uppercase text-yellow-600 dark:text-yellow-500">Heridas</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{reporte.victimas_fallecidas}</p>
              <p className="text-[10px] uppercase text-red-600 dark:text-red-400">Fallecidas</p>
            </div>
            <div className="bg-gray-500/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{reporte.victimas_sin_confirmar}</p>
              <p className="text-[10px] uppercase text-gray-600 dark:text-gray-400">Sin confirmar</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="text-blue-600 animate-spin" size={28} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <AlertTriangle size={28} className="text-red-400" />
              <p className="text-sm text-gray-500">Error al cargar evidencias o bitácora.</p>
            </div>
          ) : (
            <>
              {/* Gráfico de sensores */}
              {datosGrafico.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Resumen de sensores durante la misión
                  </h3>
                  <div className="h-56 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosGrafico}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
                        <XAxis dataKey="sensor" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="mínimo" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="promedio" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="máximo" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Galería de evidencias */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <ImageIcon size={15} /> Evidencias ({evidencias.length})
                </h3>
                {evidencias.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin evidencias registradas.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {evidencias.map(ev => (
                      <div key={ev.id} className="bg-gray-50 dark:bg-gray-800/60 rounded-lg overflow-hidden">
                        {ev.tipo === "FOTO" && ev.archivo ? (
                          <img src={ev.archivo} alt="" className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center text-gray-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                            {ev.robot ? "Captura del robot" : "Foto del operador"}
                          </p>
                          <p className="text-[10px] text-gray-400">{formatDate(ev.fecha_captura)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bitácora */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <BookText size={15} /> Bitácora ({bitacora.length})
                </h3>
                {bitacora.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin entradas de bitácora.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {bitacora.map(b => {
                      const cfg = TIPO_BITACORA_CONFIG[b.tipo_entrada] || TIPO_BITACORA_CONFIG.NOTA;
                      return (
                        <div key={b.id} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color} shrink-0`}>
                            {b.tipo_entrada}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{b.contenido}</p>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                              {b.es_voz && <Mic size={10} />}
                              {formatDate(b.fecha)} — {b.usuario_nombre ?? `Usuario #${b.usuario}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}