import { useState, useEffect } from "react";
import {
  Activity,
  Gauge,
  Wifi,
  WifiOff,
  Radio,
  Loader2,
  Database,
  ChevronDown,
  Cpu
} from "lucide-react";

const Dashboard = () => {
  const [robots, setRobots] = useState([]);
  const [selectedRobotId, setSelectedRobotId] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [lecturas, setLecturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Carga inicial de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resR, resS, resL] = await Promise.all([
          fetch('http://192.168.1.36:8000/api/robots/'),
          fetch('http://192.168.1.36:8000/api/sensores/'),
          fetch('http://192.168.1.36:8000/api/lecturas/')
        ]);

        const robotsData = await resR.json();
        const sensoresData = await resS.json();
        const lecturasData = await resL.json();

        if (robotsData.length === 0) throw new Error("NO_ROBOTS");

        setRobots(robotsData);
        setSensores(sensoresData);
        setLecturas(lecturasData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
        
        // Seleccionar el primer robot por defecto
        setSelectedRobotId(robotsData[0].id);
      } catch (err) {
        setError(err.message === "NO_ROBOTS" ? "no_robots" : "fetch_error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Filtrado dinámico según el robot seleccionado
  const robotActivo = robots.find(r => r.id === selectedRobotId);
  const sensoresDelRobot = sensores.filter(s => s.robot === selectedRobotId);
  
  // Obtener la última lectura de cada sensor del robot activo
  const ultimasLecturas = sensoresDelRobot.map(s => {
    const lectura = lecturas.find(l => l.sensor === s.id);
    return { ...s, ultimaLectura: lectura };
  });

  const formatTime = (isoString) => {
    if (!isoString) return "--:--:--";
    return new Date(isoString).toLocaleTimeString("es-ES");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Loader2 className="text-[#1F70C1] animate-spin" size={40} />
      <p className="text-[#E8E8E8]/60">Sincronizando flota...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-[#0A0A0A] border border-[#2C2F3B] rounded-xl p-10 text-center">
      <Database size={48} className="text-[#E8E8E8]/20 mb-4" />
      <h2 className="text-xl font-bold text-[#E8E8E8]">Error de Conexión</h2>
      <p className="text-[#E8E8E8]/50 mt-2">{error === "no_robots" ? "No hay robots en la DB." : "Verifica tu servidor Django."}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER CON SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0A0A0A] p-6 rounded-xl border border-[#2C2F3B]">
        <div>
          <h1 className="text-2xl font-bold text-[#E8E8E8] tracking-tight flex items-center gap-2">
            <Activity className="text-[#1F70C1]" /> TELEMETRÍA DINÁMICA
          </h1>
          <p className="text-[#E8E8E8]/60 text-sm mt-1">Monitoreando: <span className="text-[#1F70C1] font-bold">{robotActivo?.nombre}</span></p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select 
              value={selectedRobotId || ""}
              onChange={(e) => setSelectedRobotId(parseInt(e.target.value))}
              className="appearance-none bg-[#1a1c26] border border-[#2C2F3B] text-[#E8E8E8] py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-[#1F70C1] cursor-pointer text-sm"
            >
              {robots.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-[#E8E8E8]/40 pointer-events-none" size={16} />
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${robotActivo?.estado === "Activo" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"} text-xs font-mono`}>
            {robotActivo?.estado === "Activo" ? <Wifi size={14} /> : <WifiOff size={14} />}
            {robotActivo?.estado?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* TARJETAS DE SENSORES DINÁMICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ultimasLecturas.length > 0 ? (
          ultimasLecturas.map((sensor) => (
            <div key={sensor.id} className="bg-[#0A0A0A] border border-[#2C2F3B] rounded-xl p-5 hover:border-[#1F70C1]/50 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#2C2F3B] rounded-lg">
                    <Cpu className="text-[#1F70C1]" size={20} />
                  </div>
                  <span className="text-[#E8E8E8]/80 uppercase text-xs font-bold tracking-widest">{sensor.tipo}</span>
                </div>
                {sensor.ultimaLectura && (
                   <span className="text-[10px] text-green-500 font-mono animate-pulse">LIVE</span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#E8E8E8]">
                  {sensor.ultimaLectura ? sensor.ultimaLectura.valor.toFixed(1) : "---"}
                </span>
                <span className="text-[#E8E8E8]/40 text-lg">{sensor.unidad}</span>
              </div>
              <p className="text-[10px] text-[#E8E8E8]/30 mt-4 flex justify-between">
                <span>ÚLTIMA SEÑAL:</span>
                <span>{formatTime(sensor.ultimaLectura?.fecha)}</span>
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full p-10 border border-dashed border-[#2C2F3B] rounded-xl text-center text-[#E8E8E8]/40">
            Este robot no tiene sensores vinculados.
          </div>
        )}

        {/* Tarjeta Informativa del Sistema */}
        <div className="bg-[#0A0A0A] border border-[#2C2F3B] rounded-xl p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="text-[#1F70C1]" size={20} />
            <span className="text-[#E8E8E8]/80 uppercase text-xs font-bold">Resumen de Red</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#E8E8E8]/40">Ubicación GPS:</span>
              <span className="text-[#E8E8E8] font-mono">{robotActivo?.latitud.toFixed(3)}, {robotActivo?.longitud.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#E8E8E8]/40">Total Lecturas:</span>
              <span className="text-[#1F70C1] font-bold">{lecturas.filter(l => sensoresDelRobot.some(s => s.id === l.sensor)).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE HISTORIAL FILTRADA */}
      <div className="bg-[#0A0A0A] border border-[#2C2F3B] rounded-xl p-6">
        <h2 className="text-sm font-bold text-[#E8E8E8] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Database size={16} className="text-[#1F70C1]" /> Log de Registros
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[#E8E8E8]/30 border-b border-[#2C2F3B] text-[10px] uppercase">
              <tr>
                <th className="pb-3 font-medium">Timestamp</th>
                <th className="pb-3 font-medium">Sensor</th>
                <th className="pb-3 font-medium">Valor</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2F3B]">
              {lecturas
                .filter(l => sensoresDelRobot.some(s => s.id === l.sensor))
                .slice(0, 8)
                .map((l, i) => (
                  <tr key={i} className="text-[#E8E8E8]/70 hover:bg-[#1a1c26] transition-colors">
                    <td className="py-3 font-mono text-xs">{formatTime(l.fecha)}</td>
                    <td className="py-3">{sensores.find(s => s.id === l.sensor)?.tipo}</td>
                    <td className="py-3 font-bold text-[#E8E8E8]">{l.valor.toFixed(2)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px]">PROCESADO</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;