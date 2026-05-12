import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertTriangle } from "lucide-react";

import { getRobots, createRobot, updateRobot, deleteRobot } from "../features/robots/robotsApi";
import RobotTable from "../features/robots/RobotTable";
import RobotForm from "../features/robots/RobotForm";
import Modal from "../components/Modal";
import ConfirmDelete from "../components/ConfirmDelete";
import Toast from "../components/Toast";

export default function Robots() {
  const [robots, setRobots]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [fetchError, setFetchError]   = useState(false);
  const [modal, setModal]             = useState(null); // "create" | "edit" | "delete"
  const [selected, setSelected]       = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const closeModal = () => { setModal(null); setSelected(null); };

  const fetchRobots = useCallback(async () => {
    try {
      setFetchError(false);
      setLoading(true);
      setRobots(await getRobots());
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRobots(); }, [fetchRobots]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createRobot(data);
      await fetchRobots();
      closeModal();
      showToast("Robot creado correctamente.");
    } catch {
      showToast("Error al crear el robot.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    try {
      await updateRobot(selected.id, data);
      await fetchRobots();
      closeModal();
      showToast("Robot actualizado correctamente.");
    } catch {
      showToast("Error al actualizar el robot.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await deleteRobot(selected.id);
      await fetchRobots();
      closeModal();
      showToast("Robot eliminado correctamente.");
    } catch {
      showToast("Error al eliminar el robot.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

      {/* Modales */}
      {modal === "create" && (
        <Modal title="Nuevo robot" onClose={closeModal}>
          <RobotForm onSubmit={handleCreate} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar robot" onClose={closeModal}>
          <RobotForm initial={selected} onSubmit={handleEdit} onCancel={closeModal} loading={formLoading} />
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

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Robots</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {robots.length} robot{robots.length !== 1 ? "s" : ""} registrado{robots.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          // CORRECCIÓN: Tonos azules para el botón principal
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
        >
          <Plus size={16} /> Nuevo robot
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          {/* CORRECCIÓN: Tono azul para el spinner de carga */}
          <Loader2 className="text-blue-600 dark:text-blue-500 animate-spin" size={36} />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <AlertTriangle size={40} className="text-red-400 mb-3" />
          <p className="font-semibold text-gray-800 dark:text-gray-100">No se pudo conectar al servidor</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verifica que Django esté corriendo.</p>
          <button
            onClick={fetchRobots}
            // CORRECCIÓN: Tonos azules para el botón de reintentar
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : robots.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100">No hay robots registrados</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Crea el primero con el botón de arriba.</p>
        </div>
      ) : (
        <RobotTable
          robots={robots}
          onEdit={(robot) => { setSelected(robot); setModal("edit"); }}
          onDelete={(robot) => { setSelected(robot); setModal("delete"); }}
        />
      )}

    </div>
  );
}