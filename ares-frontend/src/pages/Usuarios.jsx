import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertTriangle, Building2 } from "lucide-react";
import UsuarioForm   from "../features/usuarios/UsuarioForm";
import UsuarioTable  from "../features/usuarios/UsuarioTable";
import Modal         from "../components/Modal";
import ConfirmDelete from "../components/ConfirmDelete";
import Toast         from "../components/Toast";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "../features/usuarios/usuariosApi";
import { useAuth } from "../context/AuthContext";

export default function Usuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [fetchError, setFetchError]   = useState(false);
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast  = (message, type = "success") => setToast({ message, type });
  const closeModal = () => { setModal(null); setSelected(null); };

  const fetchUsuarios = useCallback(async () => {
    try {
      setFetchError(false);
      setLoading(true);
      // Solo trae usuarios de la misma sede del admin logueado
      setUsuarios(await getUsuarios(user?.sede));
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.sede]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createUsuario(data);
      await fetchUsuarios();
      closeModal();
      showToast("Operador creado correctamente.");
    } catch {
      showToast("Error al crear el operador.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    try {
      await updateUsuario(selected.id, data);
      await fetchUsuarios();
      closeModal();
      showToast("Operador actualizado correctamente.");
    } catch {
      showToast("Error al actualizar el operador.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await deleteUsuario(selected.id);
      await fetchUsuarios();
      closeModal();
      showToast("Operador eliminado correctamente.");
    } catch {
      showToast("Error al eliminar el operador.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Solo muestra operadores — los admins no se gestionan desde aquí
  const soloOperadores = usuarios.filter(u => u.rol === "OPERADOR");

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

      {modal === "create" && (
        <Modal title="Nuevo operador" onClose={closeModal}>
          <UsuarioForm onSubmit={handleCreate} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar operador" onClose={closeModal}>
          <UsuarioForm initial={selected} onSubmit={handleEdit} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <ConfirmDelete
          itemName={selected.nombre}
          onConfirm={handleDelete}
          onCancel={closeModal}
          loading={formLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Operadores
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {soloOperadores.length} operador{soloOperadores.length !== 1 ? "es" : ""} registrado{soloOperadores.length !== 1 ? "s" : ""}
            </p>
            {user?.sede && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                               bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <Building2 size={11} /> {user.sede}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-medium rounded-lg transition-colors shadow-xs">
          <Plus size={16} /> Nuevo operador
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="text-blue-600 animate-spin" size={36} />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]
                        bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <AlertTriangle size={40} className="text-red-400 mb-3" />
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            No se pudo conectar al servidor
          </p>
          <button onClick={fetchUsuarios}
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white
                       hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      ) : soloOperadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]
                        bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            No hay operadores registrados
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Crea el primero con el botón de arriba.
          </p>
        </div>
      ) : (
        <UsuarioTable
          usuarios={soloOperadores}
          onEdit={(u) => { setSelected(u); setModal("edit"); }}
          onDelete={(u) => { setSelected(u); setModal("delete"); }}
        />
      )}
    </div>
  );
}