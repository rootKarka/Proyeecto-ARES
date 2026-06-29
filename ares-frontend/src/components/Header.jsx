import React from 'react';
import Notifications from '../components/DropdownNotifications';
import UserMenu from '../components/DropdownProfile';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User } from 'lucide-react';

function Header({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200
                       dark:border-gray-800 z-30 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Lado Izquierdo: Menú móvil y Saludo */}
          <div className="flex items-center gap-4">
            {/* Hamburger — solo visible en pantallas móviles */}
            <button
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400
                         dark:hover:text-gray-300 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              <span className="sr-only">Abrir sidebar</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <rect x="4" y="5"  width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>

            {/* Saludo al usuario */}
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                {user.rol === "ADMIN"
                  ? <ShieldCheck size={16} className="text-purple-500" />
                  : <User size={16} className="text-blue-500" />}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Hola,{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {user.nombre}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Lado Derecho: Campanita, Tema y Perfil */}
          <div className="flex items-center space-x-3">
            {/* Campanita de Notificaciones ARES */}
            <Notifications align="right" />

            {/* Cambiador de Modo Claro / Oscuro */}
            <ThemeToggle />

            {/* Línea divisoria */}
            <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700 border-none" />

            {/* Menú desplegable del Perfil */}
            <UserMenu align="right" />
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;