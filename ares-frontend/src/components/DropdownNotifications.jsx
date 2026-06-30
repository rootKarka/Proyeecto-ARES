import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Transition from '../utils/Transition';
import { Bell, MessageSquare, FileText, AlertTriangle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket'; // <-- Importamos tu hook

function DropdownNotifications({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Cambia "localhost" por "127.0.0.1"
  const socketUrl = 'wss://proyeecto-ares.onrender.com/ws/alertas/';
  const { notificacionesEnVivo } = useWebSocket(socketUrl);

  const [notifications, setNotifications] = useState([]);

  // 2. Efecto para escuchar el WebSocket e inyectar al diseño
  useEffect(() => {
    if (notificacionesEnVivo.length > 0) {
      const nuevaNotifBackend = notificacionesEnVivo[0];

      // Adaptamos la data del backend al formato visual de tu componente
      const nuevaNotificacionVisual = {
        id: Date.now(), // Generamos un ID temporal para que React no se queje
        // Traducimos los orígenes del backend a tus tipos visuales
        tipo: nuevaNotifBackend.origen === 'MENSAJE_ADMIN' ? 'MENSAJE' :
              nuevaNotifBackend.origen === 'REPORTE_CRITICO' ? 'REPORTE' : 'ALERTA',
        titulo: nuevaNotifBackend.titulo || 'Nueva Alerta',
        detalle: nuevaNotifBackend.cuerpo || 'Revisa el panel para más detalles.',
        fecha: 'Ahora mismo',
        leido: false
      };

      setNotifications((prev) => [nuevaNotificacionVisual, ...prev]);
    }
  }, [notificacionesEnVivo]);

  const trigger = useRef(null);
  const dropdown = useRef(null);

  const unreadCount = notifications.filter(n => !n.leido).length;

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) {
      setNotifications(notifications.map(n => ({ ...n, leido: true })));
    }
  };

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [dropdownOpen]);

  return (
    <div className="relative inline-flex">
      {/* Botón de la Campana */}
      <button
        ref={trigger}
        className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 
                   dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full relative 
                   ${dropdownOpen && 'bg-gray-200 dark:bg-gray-800'}`}
        aria-haspopup="true"
        onClick={handleDropdownToggle}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Notificaciones</span>
        <Bell size={18} className="text-gray-500 dark:text-gray-400" />
        
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 
                          border-white dark:border-gray-900 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Panel Desplegable */}
      <Transition
        className={`origin-top-right z-10 absolute top-full -mr-48 sm:mr-0 min-w-80 bg-white 
                   dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 
                   rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pt-1.5 pb-2 px-4 border-b border-gray-100 dark:border-gray-700/50">
            Centro de Alertas ARES
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="text-xs text-center text-gray-400 py-6">No tienes alertas pendientes</li>
            ) : (
              notifications.map((notif) => (
                <li key={notif.id} className="border-b border-gray-100 dark:border-gray-700/40 last:border-0">
                  <Link
                    className="flex gap-3 py-2.5 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                    to={notif.tipo === 'REPORTE' ? '/reportes' : '#0'}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {/* Icono condicional según tipo adaptado para incluir Alertas */}
                    <div className="mt-0.5 shrink-0">
                      {notif.tipo === 'MENSAJE' ? (
                        <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                          <MessageSquare size={15} className="text-blue-500" />
                        </div>
                      ) : notif.tipo === 'REPORTE' ? (
                        <div className="p-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-md">
                          <FileText size={15} className="text-emerald-500" />
                        </div>
                      ) : (
                        <div className="p-1 bg-red-50 dark:bg-red-900/30 rounded-md">
                          <AlertTriangle size={15} className="text-red-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {notif.titulo}
                      </span>
                      <span className="block text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
                        {notif.detalle}
                      </span>
                      <span className="block text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">
                        {notif.fecha}
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownNotifications;