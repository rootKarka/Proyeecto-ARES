import { useState, useEffect } from "react";
import { Bot, Cpu, Activity, CheckCircle, XCircle, Loader2, AlertTriangle, Database } from "lucide-react";

const API_ROBOTS   = "http://localhost:8000/api/robots/";
const API_SENSORES = "http://localhost:8000/api/sensores/";
const API_LECTURAS = "http://localhost:8000/api/lecturas/";

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resR, resS, resL] = await Promise.all([
          fetch(API_ROBOTS),
          fetch(API_SENSORES),
          fetch(API_LECTURAS),
        ]);
        const robots   = await resR.json();
        const sensores = await resS.json();
        const lecturas = await resL.json();
        setData({ robots, sensores, lecturas });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={32} />
      <span className="text-sm text-gray-500 dark:text-gray-400">Cargando sistema...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 shadow-xs rounded-xl p-10 text-center border border-gray-100 dark:border-gray-800">
      <AlertTriangle size={40} className="text-red-400 mb-3" />
      <p className="font-semibold text-gray-800 dark:text-gray-100">No se pudo conectar al servidor</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verifica que Django esté corriendo.</p>
    </div>
  );

  const { robots, sensores, lecturas } = data;
  const activos   = robots.filter(r => r.estado === "Activo").length;
  const inactivos = robots.length - activos;

  const ultimasLecturas = [...lecturas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  const formatTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
  };

  const statCards = [
    { label: "Robots registrados", value: robots.length,   icon: Bot,         color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-600/10"    },
    { label: "Robots activos",     value: activos,          icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Robots inactivos",   value: inactivos,        icon: XCircle,     color: "text-red-500 dark:text-red-400",      bg: "bg-red-500/10"     },
    { label: "Sensores",           value: sensores.length,  icon: Cpu,         color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-600/10"    },
    { label: "Total lecturas",     value: lecturas.length,  icon: Activity,    color: "text-slate-600 dark:text-slate-400",  bg: "bg-slate-500/10"   },
    {
      label: "Lecturas hoy",
      value: lecturas.filter(l => new Date(l.fecha).toDateString() === new Date().toDateString()).length,
      icon: Database,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-600/10",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">

      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resumen general del sistema ARES</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 shadow-xs rounded-xl p-5 flex items-center gap-4 border border-gray-100 dark:border-gray-800">
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${card.bg}`}>
                <Icon size={22} className={card.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flota + Últimas lecturas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Estado de la flota */}
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Bot size={16} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Estado de la flota</h2>
          </header>
          <div className="p-3">
            {robots.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No hay robots registrados.</p>
            ) : (
              <table className="table-auto w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="p-3 text-left font-semibold">Nombre</th>
                    <th className="p-3 text-left font-semibold">Estado</th>
                    <th className="p-3 text-left font-semibold">Sensores</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {robots.map(robot => {
                    const isActivo  = robot.estado === "Activo";
                    const nSensores = sensores.filter(s => s.robot === robot.id).length;
                    return (
                      <tr key={robot.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{robot.nombre}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isActivo ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                     : "bg-red-500/10 text-red-500 dark:text-red-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActivo ? "bg-emerald-500" : "bg-red-500"}`} />
                            {robot.estado}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400">
                          {nSensores} sensor{nSensores !== 1 ? "es" : ""}
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
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No hay lecturas registradas.</p>
            ) : (
              <table className="table-auto w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="p-3 text-left font-semibold">Sensor</th>
                    <th className="p-3 text-left font-semibold">Valor</th>
                    <th className="p-3 text-left font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {ultimasLecturas.map((l, i) => {
                    const sensor = sensores.find(s => s.id === l.sensor);
                    return (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{sensor?.tipo || "—"}</td>
                        <td className="p-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {l.valor?.toFixed(2)}{" "}
                          <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">{sensor?.unidad}</span>
                        </td>
                        <td className="p-3 text-xs text-gray-500 dark:text-gray-400 font-mono">{formatTime(l.fecha)}</td>
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