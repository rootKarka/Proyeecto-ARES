import { Pencil, Trash2, Cpu, Thermometer, Gauge, Volume2, MapPin, Radio } from "lucide-react";

const getSensorIcon = (tipo = "") => {
  const t = tipo.toUpperCase();
  if (t === "TEMPERATURA") return { Icon: Thermometer, color: "text-red-500", bg: "bg-red-500/10" };
  if (t === "GAS") return { Icon: Gauge, color: "text-orange-500", bg: "bg-orange-500/10" };
  if (t === "SONIDO") return { Icon: Volume2, color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (t === "ULTRASONICO" || t === "INFRARROJO") return { Icon: Radio, color: "text-purple-500", bg: "bg-purple-500/10" };
  if (t === "GPS") return { Icon: MapPin, color: "text-green-500", bg: "bg-green-500/10" };
  
  return { Icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10" };
};

export default function SensorTable({ sensores, robotsDict, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Tipo / Modelo</th>
              <th className="p-4 text-left font-semibold">Robot asignado</th>
              <th className="p-4 text-center font-semibold">Estado</th>
              <th className="p-4 text-left font-semibold">Alerta / Unidad</th>
              <th className="p-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
            {sensores.map(sensor => {
              const { Icon, color, bg } = getSensorIcon(sensor.tipo);
              const robotName = robotsDict[sensor.robot] || "Desconocido";
              return (
                <tr key={sensor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  
                  {/* ID */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${bg}`}>
                        <Icon size={16} className={color} />
                      </div>
                      <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                        SN-{sensor.id?.toString().padStart(4, "0")}
                      </span>
                    </div>
                  </td>

                  {/* Tipo / Modelo */}
                  <td className="p-4">
                    <p className="font-medium text-gray-800 dark:text-gray-100">{sensor.tipo}</p>
                    <p className="text-xs text-gray-500">{sensor.modelo}</p>
                  </td>

                  {/* Robot */}
                  <td className="p-4 font-medium text-gray-600 dark:text-gray-400">
                    {robotName}
                  </td>

                  {/* Estado (Activo) */}
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${sensor.activo ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                      {sensor.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* Umbral y Unidad */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-xs">
                        {sensor.unidad}
                      </span>
                      {sensor.umbral_critico && (
                        <span className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded" title="Umbral Crítico">
                          &gt; {sensor.umbral_critico}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(sensor)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(sensor)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}