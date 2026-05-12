import { Pencil, Trash2 } from "lucide-react";

const estadoConfig = {
  Activo:   { dot: "bg-green-500", text: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  Inactivo: { dot: "bg-red-500",   text: "text-red-600 dark:text-red-400",     bg: "bg-red-500/10"   },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
};

export default function RobotTable({ robots, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="p-4 text-left font-semibold">Nombre</th>
              <th className="p-4 text-left font-semibold">Estado</th>
              <th className="p-4 text-left font-semibold">Latitud</th>
              <th className="p-4 text-left font-semibold">Longitud</th>
              <th className="p-4 text-left font-semibold">Registro</th>
              <th className="p-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
            {robots.map(robot => {
              const cfg = estadoConfig[robot.estado] || estadoConfig.Inactivo;
              return (
                <tr key={robot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{robot.nombre}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {robot.estado}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400">{robot.latitud}</td>
                  <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400">{robot.longitud}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{formatDate(robot.fecha_registro)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(robot)}
                        // CORRECCIÓN: hover:text-blue-500 hover:bg-blue-500/10 en lugar de violet
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(robot)}
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