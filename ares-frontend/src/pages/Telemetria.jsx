import { useState, useEffect } from "react";
import { Activity, Wifi, WifiOff, Loader2, Database, ChevronDown, Cpu, Radio, MapPin, AlertTriangle } from "lucide-react";

const API_ROBOTS   = "http://localhost:8000/api/robots/";
const API_SENSORES = "http://localhost:8000/api/sensores/";
const API_LECTURAS = "http://localhost:8000/api/lecturas/";

export default function Telemetria() {
  const [robots, setRobots]               = useState([]);
  const [selectedRobotId, setSelectedRobotId] = useState(null);
  const [sensores, setSensores]           = useState([]);
  const [lecturas, setLecturas]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resR, resS, resL] = await Promise.all([
          fetch(API_ROBOTS),
          fetch(API_SENSORES),
          fetch(API_LECTURAS),
        ]);
        const robotsData   = await resR.json();
        const sensoresData = await resS.json();
        const lecturasData = await resL.json();

        if (robotsData.length === 0) throw new Error("NO_ROBOTS");

        setRobots(robotsData);
        setSensores(sensoresData);
        setLecturas(lecturasData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
        setSelectedRobotId(robotsData[0].id);
      } catch (err) {
        setError(err.message === "NO_ROBOTS" ? "no_robots" : "fetch_error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const robotActivo      = robots.find(r => r.id === selectedRobotId);
  const sensoresDelRobot = sensores.filter(s => s.robot === selectedRobotId);
  const ultimasLecturas  = sensoresDelRobot.map(s => ({
    ...s,
    ultimaLectura: lecturas.find(l => l.sensor === s.id),
  }));

  const formatTime = (iso) => {
    if (!iso) return "--:--:--";
    return new Date(iso).toLocaleTimeString("es-ES");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={32} />
      <span className="text-sm text-gray-500 dark:text-gray-400">Sincronizando flota...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800 p-10 text-center">
      <AlertTriangle size={40} className="text-red-400 mb-3" />
      <h2 className="font-semibold text-gray-800 dark:text-gray-100">
        {error === "no_robots" ? "No hay robots registrados" : "Error de conexión"}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {error === "no_robots" ? "Registra al menos un robot para ver la telemetría." : "Verifica que el servidor Django esté activo."}
      </p>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">

      {/* Header con selector */}
      <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Activity className="text-blue-600 dark:text-blue-400" size={22} />
              Telemetría
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitoreando:{" "}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{robotActivo?.nombre}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de robot */}
            <div className="relative">
              <select
                value={selectedRobotId || ""}
                onChange={e => setSelectedRobotId(parseInt(e.target.value))}
                className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {robots.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Badge estado */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              robotActivo?.estado === "Activo"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-500 dark:text-red-400"
            }`}>
              {robotActivo?.estado === "Activo" ? <Wifi size={13} /> : <WifiOff size={13} />}
              {robotActivo?.estado?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de sensores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {ultimasLecturas.length > 0 ? (
          ultimasLecturas.map(sensor => (
            <div key={sensor.id} className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600/10">
                    <Cpu className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <span className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                    {sensor.tipo}
                  </span>
                </div>
                {sensor.ultimaLectura && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {sensor.ultimaLectura ? sensor.ultimaLectura.valor.toFixed(1) : "---"}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-base">{sensor.unidad}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
                <span>Última señal</span>
                <span className="font-mono">{formatTime(sensor.ultimaLectura?.fecha)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800 p-10 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Este robot no tiene sensores vinculados.</p>
          </div>
        )}

        {/* Tarjeta resumen GPS */}
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600/10">
              <Radio className="text-blue-600 dark:text-blue-400" size={18} />
            </div>
            <span className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
              Resumen de Red
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <MapPin size={13} /> Ubicación GPS
              </span>
              <span className="font-mono text-gray-800 dark:text-gray-100 text-xs">
                {robotActivo?.latitud?.toFixed(4)}, {robotActivo?.longitud?.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
              <span className="text-gray-500 dark:text-gray-400">Total lecturas</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {lecturas.filter(l => sensoresDelRobot.some(s => s.id === l.sensor)).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Log de registros */}
      <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border border-gray-100 dark:border-gray-800">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Database size={16} className="text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Log de Registros</h2>
        </header>
        <div className="p-3">
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="p-3 text-left font-semibold">Timestamp</th>
                  <th className="p-3 text-left font-semibold">Sensor</th>
                  <th className="p-3 text-left font-semibold">Valor</th>
                  <th className="p-3 text-left font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 dark:text-gray-300">
                {lecturas
                  .filter(l => sensoresDelRobot.some(s => s.id === l.sensor))
                  .slice(0, 8)
                  .map((l, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="p-3 font-mono text-xs text-gray-500 dark:text-gray-400">{formatTime(l.fecha)}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-100">{sensores.find(s => s.id === l.sensor)?.tipo}</td>
                      <td className="p-3 font-semibold text-gray-800 dark:text-gray-100">{l.valor?.toFixed(2)}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Procesado
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}