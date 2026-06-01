import { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";

// Importamos los componentes
import MisionTable from "../features/misiones/MisionTable";
import MisionForm from "../features/misiones/MisionForm";

// Importamos las APIs de misiones sueltas
import { 
  getMisiones, 
  createMision, 
  updateMision, 
  deleteMision 
} from "../features/misiones/misionesApi";

// Importamos la API de robots que YA tenías creada
import { getRobots } from "../features/robots/robotsApi";

export default function Misiones() {
  const [misiones, setMisiones] = useState([]);
  const [robotsDisponibles, setRobotsDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [misionToEdit, setMisionToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      // Llamamos a getMisiones() y a tu getRobots() original al mismo tiempo
      const [dataMisiones, dataRobots] = await Promise.all([
        getMisiones(),
        getRobots() 
      ]);
      setMisiones(dataMisiones);
      setRobotsDisponibles(dataRobots);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleOpenForm = (mision = null) => {
    setMisionToEdit(mision);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setMisionToEdit(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (misionToEdit) {
        await updateMision(misionToEdit.id, data);
      } else {
        await createMision(data);
      }
      await fetchDatos();
      handleCloseForm();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (mision) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${mision.nombre}"?`)) return;
    try {
      await deleteMision(mision.id);
      await fetchDatos();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Misiones</h1>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Plus size={16} /> Nueva Misión
        </button>
      </div>

      {error && (
        <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <MisionTable misiones={misiones} onEdit={handleOpenForm} onDelete={handleDelete} />
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl p-4">
            <h2 className="text-lg font-semibold mb-4">
              {misionToEdit ? "Editar Misión" : "Crear Misión"}
            </h2>
            <MisionForm
              initial={misionToEdit}
              robotsDisponibles={robotsDisponibles}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              loading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}