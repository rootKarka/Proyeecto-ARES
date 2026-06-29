import { Pencil, Trash2, ShieldCheck, User } from "lucide-react";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
};

export default function UsuarioTable({ usuarios, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="p-4 text-left font-semibold">Usuario</th>
              <th className="p-4 text-left font-semibold">Email</th>
              <th className="p-4 text-left font-semibold">Sede</th>
              <th className="p-4 text-left font-semibold">Teléfono</th>
              <th className="p-4 text-left font-semibold">Estado</th>
              <th className="p-4 text-left font-semibold">Registro</th>
              <th className="p-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 dark:text-gray-300">
            {usuarios.map((u) => (
              <tr key={u.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                    text-xs font-bold
                      ${u.rol === "ADMIN"
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                        : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"}`}>
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{u.nombre}</p>
                      <p className={`text-xs font-medium
                        ${u.rol === "ADMIN"
                          ? "text-purple-500 dark:text-purple-400"
                          : "text-blue-500 dark:text-blue-400"}`}>
                        {u.rol}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="p-4">
                  {u.sede
                    ? <span className="px-2.5 py-1 rounded-full text-xs font-medium
                                       bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {u.sede}
                      </span>
                    : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400">{u.telefono || "—"}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                   text-xs font-medium
                    ${u.activo
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-red-500/10 text-red-700 dark:text-red-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full
                      ${u.activo ? "bg-green-500" : "bg-red-500"}`} />
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400">{formatDate(u.created_at)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(u)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500
                                 hover:bg-blue-500/10 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(u)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
                                 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}