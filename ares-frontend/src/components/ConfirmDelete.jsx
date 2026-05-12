import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDelete({ itemName, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirmar eliminación" onClose={onCancel}>
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="text-red-500" size={22} />
        </div>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100">
            ¿Eliminar «{itemName}»?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  );
}