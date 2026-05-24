import { Pencil, Trash2, Cpu, Thermometer, Gauge } from "lucide-react";

const getSensorIcon = (tipo = "") => {
  const t = tipo.toLowerCase();
  if (t.includes("temp"))              return { Icon: Thermometer, color: "text-red-500",    bg: "bg-red-500/10"    };
  if (t.includes("gas") || t.includes("mq")) return { Icon: Gauge,       color: "text-orange-500", bg: "bg-orange-500/10" };
  // CORRECCIÓN: El ícono genérico (Cpu) ahora es azul en lugar de violeta
  return                                      { Icon: Cpu,         color: "text-blue-500",   bg: "bg-blue-500/10"   };
};

export default function SensorTable({ sensores, robotsDict, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="p-4 text-left font-semibold">Sensor</th>
              <th className="p-4 text-left font-semibold">Tipo</th>
              <th className="p-4 text-left font-semibold">Unidad</th>
              <th className="p-4 text-left font-semibold">Robot asignado</th>
              <th className="p-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
            {sensores.map(sensor => {
              const { Icon, color, bg } = getSensorIcon(sensor.tipo);
              const robotName = robotsDict[sensor.robot] || "Desconocido";
              return (
                <tr key={sensor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  {/* Icono + serial */}
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
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{sensor.tipo}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {sensor.unidad}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{robotName}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(sensor)}
                        // CORRECCIÓN: hover en tonos azules
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