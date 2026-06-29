import { useState, useEffect, useCallback } from "react";
import {
  Bot, Cpu, Activity, Loader2, AlertTriangle, Users,
  Bell, RefreshCw, Flag, FileText, BatteryFull, BatteryLow, MapPin
} from "lucide-react";
import { API, withSede } from "../config/api";
import { useAuth } from "../context/AuthContext";

const ESTADO_CONFIG = {
  DISPONIBLE:    { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", label: "Disponible"       },
  EN_MISION:     { dot: "bg-blue-500",    text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/10",   label: "En Misión"         },
  MANTENIMIENTO: { dot: "bg-orange-500",  text: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-500/10", label: "En Mantenimiento"  },
  AVERIADO:      { dot: "bg-red-500",     text: "text-red-600 dark:text-red-400",         bg: "bg-red-500/10",    label: "Averiado"          },
  INACTIVO:      { dot: "bg-gray-400",    text: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-500/10",   label: "Inactivo"          },
};

const MISION_ESTADO_CONFIG = {
  PENDIENTE:  { bg: "bg-gray-500/10",   text: "text-gray-600 dark:text-gray-400",     dot: "bg-gray-400"   },
  EN_CURSO:   { bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",     dot: "bg-blue-500"   },
  PAUSADA:    { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  COMPLETADA: { bg: "bg-emerald-500/10",text: "text-emerald-600 dark:text-emerald-400",dot: "bg-emerald-500"},
  ABORTADA:   { bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",       dot: "bg-red-500"    },
};

const RIESGO_CONFIG = {
  NORMAL:      { bg: "bg-gray-500/10",   text: "text-gray-600 dark:text-gray-400",     dot: "bg-gray-400"   },
  PRECAUCION:  { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", dot: "bg-yellow-500" },
  ALTO_RIESGO: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  CRITICO:     { bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",       dot: "bg-red-500"    },
};

const formatTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
};

export default function Dashboard() {
  const { user } = useAuth();
  const sede = user?.sede;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setError(false);
      // Nota: ya NO se fetchea /lecturas/ aquí — esa tabla es de alto volumen
      // y el dashboard general usa los campos cacheados de robot/sensor.
      const [resR, resS, resM, resU, resA, resRep] = await Promise.all([
        fetch(withSede(API.robots, sede)),
        fetch(withSede(API.sensores, sede)),
        fetch(withSede(API.misiones, sede)),
        fetch(withSede(API.usuarios, sede)),
        fetch(withSede(API.alertas, sede)),
        fetch(withSede(API.reportesAct, sede)),
      ]);
      const [robots, sensores, misiones, usuarios, alertas, reportesAct] = await Promise.all([
        resR.json(), resS.json(), resM.json(), resU.json(), resA.json(), resRep.json(),
      ]);
      setData({ robots, sensores, misiones, usuarios, alertas, reportesAct });
      setLastUpdate(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [sede]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={32} />
      <span className="text-sm text-gray-500 dark:text-gray-400">Cargando sistema...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]
                    bg-white dark:bg-gray-900 shadow-xs rounded-xl p-10 text-center
                    border border-gray-100 dark:border-gray-800">
      <AlertTriangle size={40} className="text-red-400 mb-3" />
      <p className="font-semibold text-gray-800 dark:text-gray-100">No se pudo conectar al servidor</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verifica que Django esté corriendo.</p>
      <button onClick={fetchAll}
        className="mt-4 flex items-center gap-2 px-4 py-2 text-sm rounded-lg
                   bg-blue-600 text-white hover:bg-blue-700 transition-colors">
        <RefreshCw size={14} /> Reintentar
      </button>
    </div>
  );

  const { robots, sensores, misiones, usuarios, alertas, reportesAct } = data;

  // ── Cálculos ──────────────────────────────────────────────────
  const robotsDisponibles = robots.filter(r => r.estado === "DISPONIBLE").length;
  const robotsEnMision    = robots.filter(r => r.estado === "EN_MISION").length;
  const robotsInactivos   = robots.filter(r => ["AVERIADO", "INACTIVO", "MANTENIMIENTO"].includes(r.estado)).length;

  const misionesActivas   = misiones.filter(m => m.estado === "EN_CURSO").length;
  const misionesPendientes= misiones.filter(m => m.estado === "PENDIENTE").length;

  const usuariosActivos   = usuarios.filter(u => u.activo && u.rol === "OPERADOR").length;

  const alertasCriticas   = alertas.filter(a => ["CRITICO", "EMERGENCIA"].includes(a.nivel)).length;

  const reportesCriticos  = reportesAct.filter(r => r.nivel_riesgo === "CRITICO").length;
  const reportesHoy       = reportesAct.filter(r =>
    new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;

  const ultimosReportes   = [...reportesAct]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const misionesRecientes = [...misiones]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  const robotsActivos = robots.filter(r => r.estado === "EN_MISION");

  // ── Stat cards ────────────────────────────────────────────────
  const statCards = [
    {
      label: "Robots disponibles",
      value: robotsDisponibles,
      total: `de ${robots.length} en flota`,
      icon: Bot,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Misiones activas",
      value: misionesActivas,
      total: `${misionesPendientes} pendiente${misionesPendientes !== 1 ? "s" : ""}`,
      icon: Flag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Alertas críticas",
      value: alertasCriticas,
      total: `de ${alertas.length} totales`,
      icon: Bell,
      color: alertasCriticas > 0 ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400",
      bg:    alertasCriticas > 0 ? "bg-red-500/10"   : "bg-gray-500/10",
      border:alertasCriticas > 0 ? "border-red-500/20": "border-gray-500/20",
    },
    {
      label: "Sensores activos",
      value: sensores.filter(s => s.activo).length,
      total: `de ${sensores.length} registrados`,
      icon: Cpu,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Operadores activos",
      value: usuariosActivos,
      total: `de ${usuarios.length} usuarios`,
      icon: Users,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      label: "Reportes hoy",
      value: reportesHoy,
      total: `${reportesCriticos} crítico${reportesCriticos !== 1 ? "s" : ""} en total`,
      icon: FileText,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Resumen general del sistema ARES
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
              Actualizado: {lastUpdate.toLocaleTimeString("es-PE")}
            </span>
          )}
          <button onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                       border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i}
              className={`bg-white dark:bg-gray-900 shadow-xs rounded-xl p-5
                          flex items-center gap-4 border ${card.border}
                          dark:border-gray-800 transition-all hover:shadow-sm`}>
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${card.bg}`}>
                <Icon size={22} className={card.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-0.5 leading-none">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.total}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Fila 2: Flota + Misiones recientes ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Estado de la flota */}
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Estado de la flota</h2>
            </div>
            <div className="flex gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {robotsDisponibles} disp.
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> {robotsEnMision} misión
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" /> {robotsInactivos} inact.
              </span>
            </div>
          </header>
          <div className="p-3">
            {robots.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No hay robots registrados.</p>
            ) : (
              <table className="table-auto w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="p-3 text-left font-semibold">Nombre</th>
                    <th className="p-3 text-left font-semibold">Estado</th>
                    <th className="p-3 text-left font-semibold">Sensores</th>
                    <th className="p-3 text-left font-semibold">Ubicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {robots.map(robot => {
                    const cfg = ESTADO_CONFIG[robot.estado] || ESTADO_CONFIG.INACTIVO;
                    const nSensores = sensores.filter(s => s.robot === robot.id).length;
                    return (
                      <tr key={robot.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3 font-medium text-gray-800 dark:text-gray-100">
                          {robot.nombre}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                                           rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400">
                          {nSensores} sensor{nSensores !== 1 ? "es" : ""}
                        </td>
                        <td className="p-3 text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {robot.latitud && robot.longitud
                            ? `${parseFloat(robot.latitud).toFixed(3)}, ${parseFloat(robot.longitud).toFixed(3)}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Misiones recientes */}
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Flag size={16} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Misiones recientes</h2>
          </header>
          <div className="p-3">
            {misiones.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No hay misiones registradas.</p>
            ) : (
              <table className="table-auto w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="p-3 text-left font-semibold">Nombre</th>
                    <th className="p-3 text-left font-semibold">Tipo</th>
                    <th className="p-3 text-left font-semibold">Estado</th>
                    <th className="p-3 text-left font-semibold">Zona</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {misionesRecientes.map(m => {
                    const cfg = MISION_ESTADO_CONFIG[m.estado] || MISION_ESTADO_CONFIG.PENDIENTE;
                    return (
                      <tr key={m.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3 font-medium text-gray-800 dark:text-gray-100 max-w-[120px] truncate">
                          {m.nombre}
                        </td>
                        <td className="p-3 text-xs text-gray-500 dark:text-gray-400">
                          {m.tipo.replace(/_/g, " ")}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                                           rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {m.estado.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-400 dark:text-gray-500 max-w-[100px] truncate">
                          {m.zona_nombre || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Fila 3: Reportes de actualización + Robots en misión (telemetría en vivo) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Reportes de actualización recientes */}
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Reportes de actualización</h2>
            </div>
            {reportesCriticos > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">
                {reportesCriticos} crítico{reportesCriticos !== 1 ? "s" : ""}
              </span>
            )}
          </header>
          <div className="p-3">
            {ultimosReportes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sin reportes de actualización aún.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {ultimosReportes.map(r => {
                  const cfg = RIESGO_CONFIG[r.nivel_riesgo] || RIESGO_CONFIG.NORMAL;
                  return (
                    <li key={r.id} className="py-3 px-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5
                                           rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {r.nivel_riesgo}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[110px] truncate">
                            {r.mision_nombre}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatTime(r.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {r.resumen}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {r.victimas_rescatadas > 0 && <span>🟢 {r.victimas_rescatadas} rescatadas</span>}
                          {r.victimas_heridas > 0 && <span>🟠 {r.victimas_heridas} heridas</span>}
                          {r.victimas_fallecidas > 0 && <span>🔴 {r.victimas_fallecidas} fallecidas</span>}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {r.autor_nombre}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Robots en misión — estado en vivo (usa campos ya cacheados, sin fetch extra) */}
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Activity size={16} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Robots en misión</h2>
          </header>
          <div className="p-3">
            {robotsActivos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Ningún robot está en misión ahora.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {robotsActivos.map(robot => {
                  const bateria = robot.bateria_nivel ?? 0;
                  const bateriaBaja = bateria < 20;
                  return (
                    <li key={robot.id} className="py-3 px-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{robot.nombre}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} />
                          {robot.latitud && robot.longitud
                            ? `${parseFloat(robot.latitud).toFixed(3)}, ${parseFloat(robot.longitud).toFixed(3)}`
                            : "Sin ubicación"}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm font-semibold
                                       ${bateriaBaja ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {bateriaBaja ? <BatteryLow size={16} /> : <BatteryFull size={16} />}
                        {bateria.toFixed(0)}%
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}