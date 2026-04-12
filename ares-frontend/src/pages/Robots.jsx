import { useState, useEffect } from "react";
import { Bot, MapPin, Wifi, WifiOff, Calendar, Settings } from "lucide-react";

const Robots = () => {
  const [robots, setRobots] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/robots/')
      .then(response => response.json())
      .then(data => {
        setRobots(data);
      })
      .catch(error => console.error("Error cargando robots:", error));
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "Sin registro";
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getConnectionStatus = (estado, ultimaConexion) => {
    if (estado !== "Activo") return "inactive";
    if (!ultimaConexion) return "warning"; // Nota: Si no está en Django, siempre caerá aquí
    const last = new Date(ultimaConexion);
    const now = new Date();
    const diffMinutes = (now - last) / (1000 * 60);
    return diffMinutes < 10 ? "online" : "warning";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8E8E8] tracking-tight">
            GESTIÓN DE UNIDADES ROBÓTICAS
          </h1>
          <p className="text-[#E8E8E8]/60 text-sm mt-1">
            Flota activa:{" "}
            {robots.filter((r) => r.estado === "Activo").length} de{" "}
            {robots.length}
          </p>
        </div>
        {/* Botón visualmente inactivo para indicar que es una función futura */}
        <button className="bg-[#1F70C1]/50 cursor-not-allowed text-[#E8E8E8]/70 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors" title="Próximamente">
          <Settings size={16} />
          Gestionar Flota
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {robots.map((robot) => {
          const connStatus = getConnectionStatus(
            robot.estado,
            robot.ultima_conexion
          );
          return (
            <div
              key={robot.id}
              className="bg-[#0A0A0A] border border-[#2C2F3B] rounded-xl overflow-hidden hover:border-[#1F70C1]/40 transition-all duration-200 shadow-lg hover:shadow-blue-900/10"
            >
              {/* Cabecera de tarjeta */}
              <div className="p-5 border-b border-[#2C2F3B] bg-gradient-to-r from-[#0A0A0A] to-[#1a1c26]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#1F70C1]/10 rounded-lg">
                      <Bot className="text-[#1F70C1]" size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#E8E8E8]">
                        {robot.nombre}
                      </h3>
                      <span className="text-xs text-[#E8E8E8]/50 font-mono">
                        ID: AR-{robot.id?.toString().padStart(4, "0")}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      robot.estado === "Activo"
                        ? "bg-green-950/50 text-green-400 border border-green-500/30"
                        : "bg-gray-800 text-gray-400 border border-gray-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        robot.estado === "Activo"
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-500"
                      }`}
                    />
                    {robot.estado}
                  </span>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="p-5 space-y-4">
                {/* Estado de conexión */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#E8E8E8]/60 flex items-center gap-1.5">
                    {connStatus === "online" ? (
                      <Wifi size={16} className="text-green-500" />
                    ) : connStatus === "warning" ? (
                      <Wifi size={16} className="text-orange-400" />
                    ) : (
                      <WifiOff size={16} className="text-gray-500" />
                    )}
                    Conexión
                  </span>
                  <span
                    className={`font-mono ${
                      connStatus === "online"
                        ? "text-green-400"
                        : connStatus === "warning"
                        ? "text-orange-400"
                        : "text-gray-400"
                    }`}
                  >
                    {connStatus === "online"
                      ? "EN LÍNEA"
                      : connStatus === "warning"
                      ? "LATENCIA ALTA"
                      : "DESCONECTADO"}
                  </span>
                </div>

                {/* Ubicación con GPS */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[#E8E8E8]/60 text-sm">
                    <MapPin size={16} />
                    <span>Ubicación</span>
                  </div>
                  <div className="bg-[#2C2F3B]/30 p-3 rounded-lg border border-[#2C2F3B]">
                    <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                      <div>
                        <span className="text-[#E8E8E8]/40 text-xs block">
                          Latitud
                        </span>
                        <span className="text-[#E8E8E8]">
                          {robot.latitud ? parseFloat(robot.latitud).toFixed(6) : "0.000000"}° N
                        </span>
                      </div>
                      <div>
                        <span className="text-[#E8E8E8]/40 text-xs block">
                          Longitud
                        </span>
                        <span className="text-[#E8E8E8]">
                          {robot.longitud ? parseFloat(robot.longitud).toFixed(6) : "0.000000"}° W
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                <div className="flex items-center gap-2 text-xs text-[#E8E8E8]/40 border-t border-[#2C2F3B] pt-3">
                  <Calendar size={12} />
                  <span>Registrado: {formatDate(robot.fecha_registro)}</span>
                  <span className="ml-auto">
                    Última:{" "}
                    {robot.ultima_conexion 
                      ? new Date(robot.ultima_conexion).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </div>
              </div>

              {/* Acciones (Botón deshabilitado para mejorar UX) */}
              <div className="px-5 pb-5">
                <button 
                  disabled
                  className="w-full bg-[#2C2F3B]/50 text-[#E8E8E8]/40 cursor-not-allowed text-sm py-2 rounded-lg flex items-center justify-center gap-2 border border-[#2C2F3B]/50"
                  title="Módulo de teleoperación en desarrollo"
                >
                  <Bot size={16} />
                  Teleoperar (Próximamente)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Robots;