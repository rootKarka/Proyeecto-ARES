import { useEffect } from "react";
import { Check, AlertTriangle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-green-500",
      icon: <Check size={16} />,
    },
    error: {
      bg: "bg-red-500",
      icon: <AlertTriangle size={16} />,
    },
  };

  const { bg, icon } = config[type] || config.success;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${bg} animate-fade-in`}>
      {icon}
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 hover:opacity-75 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}