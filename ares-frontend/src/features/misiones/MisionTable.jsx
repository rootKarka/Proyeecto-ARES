import { Pencil, Trash2 } from "lucide-react";

const estadoConfig = {
  PENDIENTE:  { bg: "bg-gray-500/10",   text: "text-gray-700 dark:text-gray-400",     dot: "bg-gray-500"   },
  EN_CURSO:   { bg: "bg-blue-500/10",   text: "text-blue-700 dark:text-blue-400",     dot: "bg-blue-500"   },
  PAUSADA:    { bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  COMPLETADA: { bg: "bg-green-500/10",  text: "text-green-700 dark:text-green-400",   dot: "bg-green-500"  },
  ABORTADA:   { bg: "bg-red-500/10",    text: "text-red-700 dark:text-red-400",       dot: "bg-red-500"    },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
};

export default function MisionTable({ misiones, robotsDict = {}, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="p-4 text-left font-semibold">Nombre</th>
              <th className="p-4 text-left font-semibold">Tipo</th>
              <th className="p-4 text-left font-semibold">Estado</th>
              <th className="p-4 text-left font-semibold">Zona</th>
              <th className="p-4 text-left font-semibold">Robot</th>
              <th className="p-4 text-left font-semibold">Inicio</th>
              <th className="p-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
            {misiones.map((mision) => {
              const cfg = estadoConfig[mision.estado] || estadoConfig.PENDIENTE;
              return (
                <tr key={mision.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{mision.nombre}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{mision.tipo.replace(/_/g, " ")}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {mision.estado.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{mision.zona_nombre || "—"}</td>
                  <td className="p-4 text-gray-500">
                    {mision.robot ? (robotsDict[mision.robot] ?? `Robot #${mision.robot}`) : "—"}
                  </td>
                  <td className="p-4 text-gray-500">{formatDate(mision.fecha_inicio)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(mision)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => onDelete(mision)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
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