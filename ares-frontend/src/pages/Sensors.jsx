import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertTriangle } from "lucide-react";

import { getSensores, getRobots, createSensor, updateSensor, deleteSensor } from "../features/sensors/sensorsApi";
import SensorTable from "../features/sensors/SensorTable";
import SensorForm from "../features/sensors/SensorForm";
import Modal from "../components/Modal";
import ConfirmDelete from "../components/ConfirmDelete";
import Toast from "../components/Toast";

export default function Sensors() {
  const [sensores, setSensores]       = useState([]);
  const [robots, setRobots]           = useState([]);
  const [robotsDict, setRobotsDict]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [fetchError, setFetchError]   = useState(false);
  const [modal, setModal]             = useState(null); // "create" | "edit" | "delete"
  const [selected, setSelected]       = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const closeModal = () => { setModal(null); setSelected(null); };

  const fetchData = useCallback(async () => {
    try {
      setFetchError(false);
      setLoading(true);
      const [sensoresData, robotsData] = await Promise.all([getSensores(), getRobots()]);
      setSensores(sensoresData);
      setRobots(robotsData);
      // Diccionario id -> nombre para mostrar en la tabla
      const dict = {};
      robotsData.forEach(r => { dict[r.id] = r.nombre; });
      setRobotsDict(dict);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createSensor(data);
      await fetchData();
      closeModal();
      showToast("Sensor creado correctamente.");
    } catch {
      showToast("Error al crear el sensor.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    try {
      await updateSensor(selected.id, data);
      await fetchData();
      closeModal();
      showToast("Sensor actualizado correctamente.");
    } catch {
      showToast("Error al actualizar el sensor.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await deleteSensor(selected.id);
      await fetchData();
      closeModal();
      showToast("Sensor eliminado correctamente.");
    } catch {
      showToast("Error al eliminar el sensor.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

      {/* Modales */}
      {modal === "create" && (
        <Modal title="Nuevo sensor" onClose={closeModal}>
          <SensorForm robots={robots} onSubmit={handleCreate} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar sensor" onClose={closeModal}>
          <SensorForm initial={selected} robots={robots} onSubmit={handleEdit} onCancel={closeModal} loading={formLoading} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <ConfirmDelete
          itemName={selected.tipo}
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Sensores</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {sensores.length} sensor{sensores.length !== 1 ? "es" : ""} registrado{sensores.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          // CORRECCIÓN: Colores azules en el botón
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
        >
          <Plus size={16} /> Nuevo sensor
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          {/* CORRECCIÓN: Spinner azul */}
          <Loader2 className="text-blue-600 dark:text-blue-500 animate-spin" size={36} />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <AlertTriangle size={40} className="text-red-400 mb-3" />
          <p className="font-semibold text-gray-800 dark:text-gray-100">No se pudo conectar al servidor</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verifica que Django esté corriendo.</p>
          <button
            onClick={fetchData}
            // CORRECCIÓN: Botón reintentar azul
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : sensores.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100">No hay sensores registrados</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Crea el primero con el botón de arriba.</p>
        </div>
      ) : (
        <SensorTable
          sensores={sensores}
          robotsDict={robotsDict}
          onEdit={(sensor) => { setSelected(sensor); setModal("edit"); }}
          onDelete={(sensor) => { setSelected(sensor); setModal("delete"); }}
        />
      )}

    </div>
  );
}