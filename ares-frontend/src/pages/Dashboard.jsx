import { useState, useEffect } from "react";
import {
  Bot, Cpu, Activity, CheckCircle, XCircle,
  Loader2, AlertTriangle, Database, Users,
  MapPin, Bell, RefreshCw, Flag
} from "lucide-react";
import { API } from "../config/api";

// ── Configuración de estados del robot (igual que RobotTable) ──
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

const NIVEL_CONFIG = {
  INFO:        { bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400"     },
  ADVERTENCIA: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400" },
  CRITICO:     { bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400"       },
  EMERGENCIA:  { bg: "bg-red-600/15",    text: "text-red-700 dark:text-red-300 font-bold" },
};

const formatTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
};

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAll = async () => {
    try {
      setError(false);
      const [resR, resS, resL, resM, resU, resA] = await Promise.all([
        fetch(API.robots),
        fetch(API.sensores),
        fetch(API.lecturas),
        fetch(API.misiones),
        fetch(API.usuarios),
        fetch(API.alertas),
      ]);
      const [robots, sensores, lecturas, misiones, usuarios, alertas] = await Promise.all([
        resR.json(), resS.json(), resL.json(),
        resM.json(), resU.json(), resA.json(),
      ]);
      setData({ robots, sensores, lecturas, misiones, usuarios, alertas });
      setLastUpdate(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

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

  const { robots, sensores, lecturas, misiones, usuarios, alertas } = data;

  // ── Cálculos ──────────────────────────────────────────────────
  const robotsDisponibles = robots.filter(r => r.estado === "DISPONIBLE").length;
  const robotsEnMision    = robots.filter(r => r.estado === "EN_MISION").length;
  const robotsInactivos   = robots.filter(r => ["AVERIADO", "INACTIVO", "MANTENIMIENTO"].includes(r.estado)).length;

  const misionesActivas   = misiones.filter(m => m.estado === "EN_CURSO").length;
  const misionesPendientes= misiones.filter(m => m.estado === "PENDIENTE").length;

  const usuariosActivos   = usuarios.filter(u => u.activo && u.rol === "OPERADOR").length;

  const alertasCriticas   = alertas.filter(a => ["CRITICO", "EMERGENCIA"].includes(a.nivel)).length;

  const ultimasLecturas   = [...lecturas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 6);

  const ultimasAlertas    = [...alertas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  const misionesRecientes = [...misiones]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

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
      label: "Lecturas hoy",
      value: lecturas.filter(l =>
        new Date(l.fecha).toDateString() === new Date().toDateString()
      ).length,
      total: `${lecturas.length} en total`,
      icon: Activity,
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

      {/* ── Fila 3: Alertas recientes + Últimas lecturas ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Alertas recientes */}
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Alertas recientes</h2>
            </div>
            {alertasCriticas > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">
                {alertasCriticas} crítica{alertasCriticas !== 1 ? "s" : ""}
              </span>
            )}
          </header>
          <div className="p-3">
            {alertas.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sin alertas registradas.</p>
            ) : (
              <table className="table-auto w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="p-3 text-left font-semibold">Nivel</th>
                    <th className="p-3 text-left font-semibold">Tipo</th>
                    <th className="p-3 text-left font-semibold">Valor</th>
                    <th className="p-3 text-left font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {ultimasAlertas.map(a => {
                    const cfg = NIVEL_CONFIG[a.nivel] || NIVEL_CONFIG.INFO;
                    return (
                      <tr key={a.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            {a.nivel}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-600 dark:text-gray-400">
                          {a.tipo?.replace(/_/g, " ")}
                        </td>
                        <td className="p-3 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {a.valor_detectado}
                        </td>
                        <td className="p-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatTime(a.fecha)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Últimas lecturas */}
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Activity size={16} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Últimas lecturas</h2>
          </header>
          <div className="p-3">
            {ultimasLecturas.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No hay lecturas registradas.</p>
            ) : (
              <table className="table-auto w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="p-3 text-left font-semibold">Sensor</th>
                    <th className="p-3 text-left font-semibold">Valor</th>
                    <th className="p-3 text-left font-semibold">Nivel</th>
                    <th className="p-3 text-left font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {ultimasLecturas.map((l, i) => {
                    const sensor = sensores.find(s => s.id === l.sensor);
                    const nivelCfg = NIVEL_CONFIG[l.nivel_alerta] || NIVEL_CONFIG.INFO;
                    return (
                      <tr key={i}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3 font-medium text-gray-800 dark:text-gray-100">
                          {sensor?.tipo || "—"}
                        </td>
                        <td className="p-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {l.valor?.toFixed(2)}{" "}
                          <span className="text-gray-400 font-normal text-xs">{sensor?.unidad}</span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${nivelCfg.bg} ${nivelCfg.text}`}>
                            {l.nivel_alerta || "NORMAL"}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap">
                          {formatTime(l.fecha)}
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

    </div>
  );
}