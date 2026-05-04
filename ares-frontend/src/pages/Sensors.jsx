import { useState, useEffect } from "react";
import { 
  Cpu, 
  Bot, 
  Activity, 
  Gauge, 
  Thermometer, 
  Loader2, 
  Database,
  Hash
} from "lucide-react";

const Sensors = () => {
  const [sensores, setSensores] = useState([]);
  const [robotsDict, setRobotsDict] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Usamos Promise.all para hacer ambas peticiones al mismo tiempo
    Promise.all([
      fetch('http://192.168.1.36:8000/api/sensores/').then(res => res.json()),
      fetch('http://192.168.1.36:8000/api/robots/').then(res => res.json())
    ])
      .then(([sensoresData, robotsData]) => {
        // Creamos un diccionario de robots para buscar sus nombres fácilmente por ID
        // Ejemplo: { 1: "ARES-ALPHA", 2: "ARES-BETA" }
        const dict = {};
        if (Array.isArray(robotsData)) {
          robotsData.forEach(robot => {
            dict[robot.id] = robot.nombre;
          });
        }
        
        setRobotsDict(dict);
        setSensores(Array.isArray(sensoresData) ? sensoresData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando el panel de sensores:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Función para asignar un ícono y color dependiendo del tipo de sensor
  const getSensorStyles = (tipo = "") => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("gas") || tipoLower.includes("mq")) {
      return { icon: Gauge, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-500/30" };
    }
    if (tipoLower.includes("temp")) {
      return { icon: Thermometer, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-500/30" };
    }
    return { icon: Cpu, color: "text-[#1F70C1]", bg: "bg-[#1F70C1]/10", border: "border-[#1F70C1]/30" };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="text-[#1F70C1] animate-spin" size={40} />
        <p className="text-[#E8E8E8]/60 animate-pulse">Sincronizando red de sensores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-[#0A0A0A] border border-[#2C2F3B] rounded-xl p-10 text-center">
        <Database size={48} className="text-red-500/40 mb-4" />
        <h2 className="text-xl font-bold text-[#E8E8E8]">Error de Conexión</h2>
        <p className="text-[#E8E8E8]/50 mt-2 max-w-md">
          No se pudo establecer enlace con la base de datos de sensores. Verifica tu backend.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E8E8E8] tracking-tight">
            RED DE SENSORES TÁCTICOS
          </h1>
          <p className="text-[#E8E8E8]/60 text-sm mt-1">
            Módulos de hardware registrados: {sensores.length}
          </p>
        </div>
      </div>

      {sensores.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-[#2C2F3B] rounded-xl p-10 text-center">
          <Activity size={48} className="text-[#E8E8E8]/20 mx-auto mb-4" />
          <h3 className="text-[#E8E8E8] font-medium text-lg">Hardware no detectado</h3>
          <p className="text-[#E8E8E8]/50 text-sm mt-2">
            No existen sensores vinculados en la base de datos de Django.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sensores.map((sensor) => {
            const { icon: Icon, color, bg, border } = getSensorStyles(sensor.tipo);
            const robotName = robotsDict[sensor.robot] || "Robot Desconocido";

            return (
              <div
                key={sensor.id}
                className="bg-[#0A0A0A] border border-[#2C2F3B] rounded-xl overflow-hidden hover:border-[#1F70C1]/40 transition-all duration-200 shadow-lg"
              >
                {/* Cabecera del Sensor */}
                <div className="p-5 border-b border-[#2C2F3B] bg-gradient-to-r from-[#0A0A0A] to-[#1a1c26]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${bg}`}>
                        <Icon className={color} size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#E8E8E8] uppercase tracking-wide">
                          {sensor.tipo || "Sensor Genérico"}
                        </h3>
                        <span className="flex items-center gap-1 text-xs text-[#E8E8E8]/50 font-mono mt-0.5">
                          <Hash size={12} />
                          SN-{sensor.id?.toString().padStart(4, "0")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles del Sensor */}
                <div className="p-5 space-y-4 bg-[#0A0A0A]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#E8E8E8]/60 flex items-center gap-1.5">
                      <Activity size={16} className="text-[#1F70C1]" />
                      Unidad de Medida
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#2C2F3B] text-[#E8E8E8]`}>
                      {sensor.unidad || "N/A"}
                    </span>
                  </div>

                  {/* Asignación de Robot */}
                  <div className="pt-3 border-t border-[#2C2F3B]">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#2C2F3B] rounded-md">
                        <Bot size={14} className="text-[#E8E8E8]/80" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#E8E8E8]/40 uppercase tracking-wider font-semibold">
                          Asignado a
                        </span>
                        <span className="text-sm text-[#E8E8E8] font-medium">
                          {robotName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sensors;