import { useState, useEffect } from "react";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import MisionTable from "../features/misiones/MisionTable";
import MisionForm  from "../features/misiones/MisionForm";
import Modal       from "../components/Modal";
import ConfirmDelete from "../components/ConfirmDelete";
import Toast       from "../components/Toast";
import { getMisiones, createMision, updateMision, deleteMision } from "../features/misiones/misionesApi";
import { getRobots }     from "../features/robots/robotsApi";
import { getOperadores } from "../features/usuarios/usuariosApi";

export default function Misiones() {
  const [misiones, setMisiones]                 = useState([]);
  const [robotsDisponibles, setRobotsDisponibles]   = useState([]);
  const [operadoresDisponibles, setOperadoresDisponibles] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [modal, setModal]           = useState(null); // "create" | "edit" | "delete"
  const [selected, setSelected]     = useState(null);
  const [toast, setToast]           = useState(null);

  const showToast  = (message, type = "success") => setToast({ message, type });
  const closeModal = () => { setModal(null); setSelected(null); };

  const fetchDatos = async () => {
    try {
      setFetchError(false);
      setLoading(true);
      const [dataMisiones, dataRobots, dataOperadores] = await Promise.all([
        getMisiones(),
        getRobots(),
        getOperadores(),
      ]);
      setMisiones(dataMisiones);
      setRobotsDisponibles(dataRobots);
      setOperadoresDisponibles(dataOperadores);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createMision(data);
      await fetchDatos();
      closeModal();
      showToast("Misión creada correctamente.");
    } catch {
      showToast("Error al crear la misión.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    try {
      await updateMision(selected.id, data);
      await fetchDatos();
      closeModal();
      showToast("Misión actualizada correctamente.");
    } catch {
      showToast("Error al actualizar la misión.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await deleteMision(selected.id);
      await fetchDatos();
      closeModal();
      showToast("Misión eliminada correctamente.");
    } catch {
      showToast("Error al eliminar la misión.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Diccionario id → nombre para la tabla
  const robotsDict = Object.fromEntries(robotsDisponibles.map(r => [r.id, r.nombre]));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

      {modal === "create" && (
        <Modal title="Nueva misión" onClose={closeModal}>
          <MisionForm
            robotsDisponibles={robotsDisponibles}
            operadoresDisponibles={operadoresDisponibles}
            onSubmit={handleCreate}
            onCancel={closeModal}
            loading={formLoading}
          />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Editar misión" onClose={closeModal}>
          <MisionForm
            initial={selected}
            robotsDisponibles={robotsDisponibles}
            operadoresDisponibles={operadoresDisponibles}
            onSubmit={handleEdit}
            onCancel={closeModal}
            loading={formLoading}
          />
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Misiones</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {misiones.length} misión{misiones.length !== 1 ? "es" : ""} registrada{misiones.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-medium rounded-lg transition-colors shadow-xs">
          <Plus size={16} /> Nueva misión
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="text-blue-600 animate-spin" size={36} />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-gray-800
                        shadow-xs rounded-xl p-10 text-center">
          <AlertCircle size={40} className="text-red-400 mb-3" />
          <p className="font-semibold text-gray-800 dark:text-gray-100">No se pudo conectar al servidor</p>
          <button onClick={fetchDatos}
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      ) : misiones.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-gray-800
                        shadow-xs rounded-xl p-10 text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100">No hay misiones registradas</p>
          <p className="text-sm text-gray-500 mt-1">Crea la primera con el botón de arriba.</p>
        </div>
      ) : (
        <MisionTable
          misiones={misiones}
          robotsDict={robotsDict}
          onEdit={(m) => { setSelected(m); setModal("edit"); }}
          onDelete={(m) => { setSelected(m); setModal("delete"); }}
        />
      )}
    </div>
  );
}