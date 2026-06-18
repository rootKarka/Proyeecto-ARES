import { useState, useEffect, useRef, useCallback } from "react";
import {
  Activity, Wifi, WifiOff, Loader2, Database,
  ChevronDown, Cpu, Radio, MapPin, AlertTriangle,
  Battery, Signal, Gauge, RefreshCw, Thermometer,
  Volume2, Wind
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { API, withSede } from "../config/api";
import { useAuth } from "../context/AuthContext";

// ── Icono por tipo de sensor ──────────────────────────────────
const getSensorIcon = (tipo = "") => {
  const t = tipo.toUpperCase();
  if (t === "TEMPERATURA") return { Icon: Thermometer, color: "text-red-500",    bg: "bg-red-500/10"    };
  if (t === "GAS")         return { Icon: Wind,        color: "text-orange-500", bg: "bg-orange-500/10" };
  if (t === "SONIDO")      return { Icon: Volume2,     color: "text-yellow-500", bg: "bg-yellow-500/10" };
  return                          { Icon: Cpu,         color: "text-blue-500",   bg: "bg-blue-500/10"   };
};

// ── Color de línea por tipo ───────────────────────────────────
const getLineColor = (tipo = "") => {
  const t = tipo.toUpperCase();
  if (t === "TEMPERATURA") return "#ef4444";
  if (t === "GAS")         return "#f97316";
  if (t === "SONIDO")      return "#eab308";
  return "#3b82f6";
};

// ── Tooltip personalizado del gráfico ────────────────────────
const CustomTooltip = ({ active, payload, label, unidad }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="font-bold text-gray-800 dark:text-gray-100">
        {payload[0].value?.toFixed(2)} {unidad}
      </p>
    </div>
  );
};

// ── Gráfico de un sensor con ventana de 1 minuto ─────────────
function SensorChart({ sensor, historial }) {
  const { Icon, color, bg } = getSensorIcon(sensor.tipo);
  const lineColor = getLineColor(sensor.tipo);

  // Solo datos del último minuto
  const ahora = Date.now();
  const datos = historial
    .filter(l => ahora - new Date(l.fecha).getTime() <= 60_000)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map(l => ({
      tiempo: new Date(l.fecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      valor:  l.valor,
    }));

  const ultimoValor = historial[0]?.valor;
  const nivelAlerta = historial[0]?.nivel_alerta;

  const nivelColor = {
    NORMAL:      "text-emerald-600 dark:text-emerald-400",
    ADVERTENCIA: "text-yellow-600 dark:text-yellow-500",
    CRITICO:     "text-red-600 dark:text-red-400",
  }[nivelAlerta] || "text-gray-400";

  return (
    <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border
                    border-gray-100 dark:border-gray-800 p-5">

      {/* Header de la tarjeta */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${bg}`}>
            <Icon size={16} className={color} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider
                          text-gray-400 dark:text-gray-500">
              {sensor.tipo}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600">{sensor.modelo}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none">
            {ultimoValor != null ? ultimoValor.toFixed(1) : "—"}
            <span className="text-sm font-normal text-gray-400 ml-1">{sensor.unidad}</span>
          </p>
          {nivelAlerta && (
            <span className={`text-[10px] font-semibold uppercase ${nivelColor}`}>
              {nivelAlerta}
            </span>
          )}
        </div>
      </div>

      {/* Gráfico deslizable */}
      <div className="h-36">
        {datos.length < 2 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Esperando datos del último minuto...
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3"
                stroke="rgba(156,163,175,0.15)" />
              <XAxis
                dataKey="tiempo"
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              {sensor.umbral_critico && (
                <ReferenceLine
                  y={sensor.umbral_critico}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  label={{ value: "límite", fontSize: 9, fill: "#ef4444" }}
                />
              )}
              <Tooltip content={<CustomTooltip unidad={sensor.unidad} />} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500
                      border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
        <span>Ventana: último minuto</span>
        <span className="font-mono">
          {historial[0]
            ? new Date(historial[0].fecha).toLocaleTimeString("es-PE")
            : "--:--:--"}
        </span>
      </div>
    </div>
  );
}

// ── Tarjeta de telemetría del robot ──────────────────────────
function TelemetriaRobotCard({ telemetria }) {
  if (!telemetria) return (
    <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border
                    border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10">
          <Radio className="text-blue-500" size={16} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Estado del Robot
        </p>
      </div>
      <p className="text-xs text-gray-400 text-center py-4">
        Sin datos de telemetría aún.
      </p>
    </div>
  );

  const bateriaColor = telemetria.bateria_nivel < 20
    ? "text-red-500" : telemetria.bateria_nivel < 50
    ? "text-yellow-500" : "text-emerald-500";

  const inclMax = Math.max(
    Math.abs(telemetria.inclinacion_lateral),
    Math.abs(telemetria.inclinacion_frontal)
  );

  return (
    <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl border
                    border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10">
            <Radio className="text-blue-500" size={16} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Estado del Robot
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800
                         text-gray-500 dark:text-gray-400 font-medium">
          {telemetria.modo_conduccion}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Batería */}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Battery size={12} className={bateriaColor} />
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Batería</span>
          </div>
          <p className={`text-xl font-bold ${bateriaColor}`}>
            {telemetria.bateria_nivel?.toFixed(0)}%
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {telemetria.bateria_voltaje?.toFixed(1)} V
          </p>
        </div>

        {/* Señal */}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Signal size={12} className="text-blue-500" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Señal</span>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {telemetria.senal_rssi} <span className="text-xs font-normal text-gray-400">dBm</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Latencia: {telemetria.latencia_ms} ms
          </p>
        </div>

        {/* Velocidad */}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge size={12} className="text-purple-500" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Velocidad</span>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {telemetria.velocidad?.toFixed(1)}
            <span className="text-xs font-normal text-gray-400 ml-1">m/s</span>
          </p>
        </div>

        {/* Inclinación */}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={12} className={inclMax > 35 ? "text-red-500" : "text-gray-400"} />
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Inclinación</span>
          </div>
          <p className={`text-xl font-bold ${inclMax > 35 ? "text-red-500" : "text-gray-800 dark:text-gray-100"}`}>
            {inclMax.toFixed(1)}°
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            L: {telemetria.inclinacion_lateral?.toFixed(1)}° F: {telemetria.inclinacion_frontal?.toFixed(1)}°
          </p>
        </div>
      </div>

      {/* GPS */}
      <div className="flex items-center justify-between mt-3 pt-3
                      border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <MapPin size={12} />
          <span>GPS</span>
        </div>
        <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
          {parseFloat(telemetria.latitud)?.toFixed(5)},
          {parseFloat(telemetria.longitud)?.toFixed(5)}
        </span>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function Telemetria() {
  const { user } = useAuth();
  const sede = user?.sede;

  const [robots, setRobots]               = useState([]);
  const [selectedRobotId, setSelectedRobotId] = useState(null);
  const [sensores, setSensores]           = useState([]);
  // historial: { [sensorId]: [ ...lecturas ] }
  const [historial, setHistorial]         = useState({});
  const [telemetriaRobot, setTelemetriaRobot] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const intervaloRef = useRef(null);

  // Carga inicial: robots y sensores
  useEffect(() => {
    const fetchInicial = async () => {
      try {
        const [resR, resS] = await Promise.all([
          fetch(withSede(API.robots, sede)),
          fetch(withSede(API.sensores, sede)),
        ]);
        const robotsData   = await resR.json();
        const sensoresData = await resS.json();

        if (!Array.isArray(robotsData) || robotsData.length === 0)
          throw new Error("NO_ROBOTS");

        setRobots(robotsData);
        setSensores(sensoresData);
        setSelectedRobotId(robotsData[0].id);
      } catch (err) {
        setError(err.message === "NO_ROBOTS" ? "no_robots" : "fetch_error");
      } finally {
        setLoading(false);
      }
    };
    fetchInicial();
  }, [sede]);

  // Polling: cada 3s trae lecturas y telemetría del robot seleccionado
  const fetchDatosRobot = useCallback(async (robotId) => {
    if (!robotId) return;
    try {
      const [resL, resT] = await Promise.all([
        fetch(withSede(API.lecturas, sede)),
        fetch(`${API.telemetria}robot/${robotId}/`),
      ]);
      const lecturasData   = await resL.json();
      const telemetriaData = await resT.json();

      // Filtrar lecturas del robot seleccionado
      const sensoresDelRobot = sensores.filter(s => s.robot === robotId);
      const lecturasRobot    = Array.isArray(lecturasData)
        ? lecturasData.filter(l => sensoresDelRobot.some(s => s.id === l.sensor))
        : [];

      // Construir historial por sensor
      const nuevoHistorial = {};
      sensoresDelRobot.forEach(s => {
        const lecsSensor = lecturasRobot
          .filter(l => l.sensor === s.id)
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        nuevoHistorial[s.id] = lecsSensor;
      });

      setHistorial(nuevoHistorial);

      // Última telemetría del robot
      if (Array.isArray(telemetriaData) && telemetriaData.length > 0) {
        setTelemetriaRobot(telemetriaData[0]);
      } else {
        setTelemetriaRobot(null);
      }
    } catch {
      // silencioso — no interrumpir la UI en polling
    }
  }, [sensores, sede]);

  // Arrancar/reiniciar polling cuando cambia el robot seleccionado
  useEffect(() => {
    if (!selectedRobotId) return;
    fetchDatosRobot(selectedRobotId);
    intervaloRef.current = setInterval(() => {
      fetchDatosRobot(selectedRobotId);
    }, 3000);
    return () => clearInterval(intervaloRef.current);
  }, [selectedRobotId, fetchDatosRobot]);

  const robotActivo      = robots.find(r => r.id === selectedRobotId);
  const sensoresDelRobot = sensores.filter(s => s.robot === selectedRobotId);

  const formatTime = (iso) => {
    if (!iso) return "--:--:--";
    return new Date(iso).toLocaleTimeString("es-PE");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={32} />
      <span className="text-sm text-gray-500 dark:text-gray-400">Sincronizando flota...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]
                    bg-white dark:bg-gray-900 shadow-xs rounded-xl
                    border border-gray-100 dark:border-gray-800 p-10 text-center">
      <AlertTriangle size={40} className="text-red-400 mb-3" />
      <h2 className="font-semibold text-gray-800 dark:text-gray-100">
        {error === "no_robots" ? "No hay robots registrados" : "Error de conexión"}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {error === "no_robots"
          ? "Registra al menos un robot para ver la telemetría."
          : "Verifica que el servidor Django esté activo."}
      </p>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl
                      border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100
                           flex items-center gap-2">
              <Activity className="text-blue-600 dark:text-blue-400" size={22} />
              Telemetría
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitoreando:{" "}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {robotActivo?.nombre}
              </span>
              {sede && (
                <span className="ml-2 text-xs text-gray-400">· Sede {sede}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de robot */}
            <div className="relative">
              <select
                value={selectedRobotId || ""}
                onChange={e => setSelectedRobotId(parseInt(e.target.value))}
                className="appearance-none bg-gray-50 dark:bg-gray-800 border
                           border-gray-200 dark:border-gray-700 text-gray-800
                           dark:text-gray-100 text-sm py-2 pl-4 pr-10 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {robots.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                size={16} />
            </div>

            {/* Badge estado */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                              text-xs font-medium ${
              robotActivo?.estado === "DISPONIBLE" || robotActivo?.estado === "EN_MISION"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-500 dark:text-red-400"
            }`}>
              {robotActivo?.estado === "DISPONIBLE" || robotActivo?.estado === "EN_MISION"
                ? <Wifi size={13} />
                : <WifiOff size={13} />}
              {robotActivo?.estado?.replace(/_/g, " ")}
            </span>

            {/* Indicador de polling */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En vivo
            </div>
          </div>
        </div>
      </div>

      {/* ── Gráficos de sensores (ventana 1 minuto) ── */}
      {sensoresDelRobot.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400
                         uppercase tracking-wider mb-3 px-1">
            Sensores — último minuto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {sensoresDelRobot.map(sensor => (
              <SensorChart
                key={sensor.id}
                sensor={sensor}
                historial={historial[sensor.id] || []}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl
                        border border-gray-100 dark:border-gray-800 p-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Este robot no tiene sensores vinculados.
          </p>
        </div>
      )}

      {/* ── Estado del robot (TelemetriaRobot) + GPS ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400
                       uppercase tracking-wider mb-3 px-1">
          Estado del robot
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <TelemetriaRobotCard telemetria={telemetriaRobot} />
        </div>
      </div>

      {/* ── Log de registros ── */}
      <div className="bg-white dark:bg-gray-900 shadow-xs rounded-xl
                      border border-gray-100 dark:border-gray-800">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-800
                           flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Log de registros</h2>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Últimas 10 lecturas del robot
          </span>
        </header>
        <div className="p-3 overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="text-xs uppercase text-gray-400 dark:text-gray-500
                              bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="p-3 text-left font-semibold">Timestamp</th>
                <th className="p-3 text-left font-semibold">Sensor</th>
                <th className="p-3 text-left font-semibold">Valor</th>
                <th className="p-3 text-left font-semibold">Nivel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 dark:text-gray-300">
              {Object.entries(historial)
                .flatMap(([sensorId, lecs]) =>
                  lecs.map(l => ({
                    ...l,
                    tipoSensor: sensores.find(s => s.id === parseInt(sensorId))?.tipo,
                    unidad:     sensores.find(s => s.id === parseInt(sensorId))?.unidad,
                  }))
                )
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 10)
                .map((l, i) => {
                  const nivelColor = {
                    NORMAL:      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    ADVERTENCIA: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
                    CRITICO:     "bg-red-500/10 text-red-600 dark:text-red-400",
                  }[l.nivel_alerta] || "bg-gray-500/10 text-gray-500";

                  return (
                    <tr key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="p-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(l.fecha)}
                      </td>
                      <td className="p-3 text-gray-800 dark:text-gray-100">{l.tipoSensor}</td>
                      <td className="p-3 font-semibold text-gray-800 dark:text-gray-100">
                        {l.valor?.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-gray-400">{l.unidad}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${nivelColor}`}>
                          {l.nivel_alerta || "NORMAL"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {Object.keys(historial).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400 text-sm">
                    Sin lecturas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}