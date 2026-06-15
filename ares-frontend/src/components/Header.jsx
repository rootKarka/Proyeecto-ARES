import React, { useState } from 'react';
import SearchModal from '../components/ModalSearch';
import Notifications from '../components/DropdownNotifications';
import Help from '../components/DropdownHelp';
import UserMenu from '../components/DropdownProfile';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User } from 'lucide-react';

function Header({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200
                       dark:border-gray-800 z-30 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left side */}
          <div className="flex items-center gap-4">

            {/* Hamburger — solo mobile */}
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
                  ? <ShieldCheck size={15} className="text-purple-500" />
                  : <User size={15} className="text-blue-500" />}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Hola,{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {user.nombre}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">

            {/* Buscar */}
            <div>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded-full ml-3
                            hover:bg-gray-100 lg:hover:bg-gray-200
                            dark:hover:bg-gray-800 dark:lg:hover:bg-gray-700
                            ${searchModalOpen ? "bg-gray-200 dark:bg-gray-800" : ""}`}
                onClick={(e) => { e.stopPropagation(); setSearchModalOpen(true); }}
                aria-controls="search-modal"
              >
                <span className="sr-only">Buscar</span>
                <svg className="fill-current text-gray-500 dark:text-gray-400"
                  width={16} height={16} viewBox="0 0 16 16">
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
                  <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
                </svg>
              </button>
              <SearchModal
                id="search-modal"
                searchId="search"
                modalOpen={searchModalOpen}
                setModalOpen={setSearchModalOpen}
              />
            </div>

            <Notifications align="right" />
            <Help align="right" />
            <ThemeToggle />

            {/* Divider */}
            <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700 border-none" />

            <UserMenu align="right" />
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;