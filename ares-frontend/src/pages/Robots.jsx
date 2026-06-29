import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

import { getRobots, updateRobot } from "../features/robots/robotsApi";
// Agrega esta línea al inicio de Robots.jsx y Sensors.jsx
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta según tu proyecto
import RobotTable from "../features/robots/RobotTable";
import RobotForm from "../features/robots/RobotForm";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import RobotMapModal from "../components/RobotMapModal";

export default function Robots() {
  const { user } = useAuth();
  const sede = user?.sede;

  const [robots, setRobots]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [fetchError, setFetchError]   = useState(false);
  const [modal, setModal]             = useState(null); // "edit" | "map"
  const [selected, setSelected]       = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const closeModal = () => { setModal(null); setSelected(null); };

  const fetchRobots = useCallback(async () => {
    try {
      setFetchError(false);
      setLoading(true);
      setRobots(await getRobots(sede));
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [sede]);

  useEffect(() => { fetchRobots(); }, [fetchRobots]);

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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

      {modal === "edit" && selected && (
        <Modal title="Editar robot" onClose={closeModal}>
          <RobotForm initial={selected} onSubmit={handleEdit} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}

      {modal === "map" && selected && (
        <RobotMapModal robot={selected} onClose={closeModal} />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header — sin botón de crear */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Flota de Robots</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {robots.length} robot{robots.length !== 1 ? "s" : ""} en operación
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="text-blue-600 dark:text-blue-500 animate-spin" size={36} />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <AlertTriangle size={40} className="text-red-400 mb-3" />
          <p className="font-semibold text-gray-800 dark:text-gray-100">No se pudo conectar al servidor</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verifica que Django esté corriendo.</p>
          <button
            onClick={fetchRobots}
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : robots.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100">No hay robots registrados</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Los robots se agregan desde el panel de Django.</p>
        </div>
      ) : (
        <RobotTable
          robots={robots}
          onEdit={(robot) => { setSelected(robot); setModal("edit"); }}
          onShowMap={(robot) => { setSelected(robot); setModal("map"); }}
        />
      )}

    </div>
  );
}