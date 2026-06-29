import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import Transition from '../utils/Transition';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../images/user-avatar-32.png';

function DropdownProfile({ align }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger  = useRef(null);
  const dropdown = useRef(null);

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        {/* Avatar con inicial */}
        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30
                        flex items-center justify-center text-blue-500 font-bold text-sm shrink-0">
          {user?.nombre?.charAt(0).toUpperCase() ?? "?"}
        </div>

        <div className="flex items-center truncate">
          <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100
                           group-hover:text-gray-800 dark:group-hover:text-white">
            {user?.nombre ?? "Usuario"}
          </span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-52 bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg
                    overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
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
          {/* Info del usuario */}
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-2 mb-0.5">
              {user?.rol === "ADMIN"
                ? <ShieldCheck size={13} className="text-purple-500 shrink-0" />
                : <User size={13} className="text-blue-500 shrink-0" />}
              <span className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                {user?.nombre ?? "Usuario"}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold
                ${user?.rol === "ADMIN"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                {user?.rol === "ADMIN" ? "Administrador" : "Operador"}
              </span>
            </div>
          </div>

          {/* Opciones */}
          <ul className="px-1">
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg
                           text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownProfile;