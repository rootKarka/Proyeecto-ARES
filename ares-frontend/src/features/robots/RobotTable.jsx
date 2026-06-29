import { Pencil, MapPin } from "lucide-react";

const estadoConfig = {
  DISPONIBLE:    { dot: "bg-green-500",  text: "text-green-700 dark:text-green-400",   bg: "bg-green-500/10", label: "Disponible" },
  EN_MISION:     { dot: "bg-blue-500",   text: "text-blue-700 dark:text-blue-400",     bg: "bg-blue-500/10",  label: "En Misión" },
  MANTENIMIENTO: { dot: "bg-orange-500", text: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500/10", label: "En Mantenimiento" },
  AVERIADO:      { dot: "bg-red-500",    text: "text-red-700 dark:text-red-400",       bg: "bg-red-500/10",   label: "Averiado" },
  INACTIVO:      { dot: "bg-gray-500",   text: "text-gray-700 dark:text-gray-400",     bg: "bg-gray-500/10",  label: "Inactivo" },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
};

export default function RobotTable({ robots, onEdit, onShowMap }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="p-4 text-left font-semibold">Nombre</th>
              <th className="p-4 text-left font-semibold">MAC Address</th>
              <th className="p-4 text-left font-semibold">Estado</th>
              <th className="p-4 text-left font-semibold">Ubicación</th>
              <th className="p-4 text-left font-semibold">Registro</th>
              <th className="p-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
            {robots.map(robot => {
              const cfg = estadoConfig[robot.estado] || estadoConfig.INACTIVO;
              return (
                <tr key={robot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{robot.nombre}</td>
                  <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400">{robot.mac_address || "—"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>

                  {/* Botón de mapa en vez de columnas lat/lng */}
                  <td className="p-4">
                    <button
                      onClick={() => onShowMap(robot)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                                 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                    >
                      <MapPin size={13} /> Ver mapa
                    </button>
                  </td>

                  <td className="p-4 text-gray-500 dark:text-gray-400">{formatDate(robot.created_at)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => onEdit(robot)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
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