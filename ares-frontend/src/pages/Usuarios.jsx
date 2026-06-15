import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import UsuarioForm  from "../features/usuarios/UsuarioForm";
import UsuarioTable from "../features/usuarios/UsuarioTable";
import Modal        from "../components/Modal";
import ConfirmDelete from "../components/ConfirmDelete";
import Toast        from "../components/Toast";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "../features/usuarios/usuariosApi";

export default function Usuarios() {
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
      setUsuarios(await getUsuarios());
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createUsuario(data);
      await fetchUsuarios();
      closeModal();
      showToast("Usuario creado correctamente.");
    } catch {
      showToast("Error al crear el usuario.", "error");
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
      showToast("Usuario actualizado correctamente.");
    } catch {
      showToast("Error al actualizar el usuario.", "error");
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
      showToast("Usuario eliminado correctamente.");
    } catch {
      showToast("Error al eliminar el usuario.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

      {modal === "create" && (
        <Modal title="Nuevo usuario" onClose={closeModal}>
          <UsuarioForm onSubmit={handleCreate} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar usuario" onClose={closeModal}>
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-medium rounded-lg transition-colors shadow-xs">
          <Plus size={16} /> Nuevo usuario
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
          <p className="font-semibold text-gray-800 dark:text-gray-100">No se pudo conectar al servidor</p>
          <button onClick={fetchUsuarios}
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]
                        bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100">No hay usuarios registrados</p>
          <p className="text-sm text-gray-500 mt-1">Crea el primero con el botón de arriba.</p>
        </div>
      ) : (
        <UsuarioTable
          usuarios={usuarios}
          onEdit={(u) => { setSelected(u); setModal("edit"); }}
          onDelete={(u) => { setSelected(u); setModal("delete"); }}
        />
      )}
    </div>
  );
}