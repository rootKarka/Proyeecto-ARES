import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  const navItem = (to, label, icon, exact = false) => {
    const isActive = exact ? pathname === to : pathname.startsWith(to);
    return (
      <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 bg-linear-to-r ${isActive ? "from-blue-600/[0.12] dark:from-blue-500/[0.20] to-blue-600/[0.04]" : ""}`}>
        <NavLink
          end={exact}
          to={to}
          // AGREGADO: onClick para que expanda el sidebar al hacer clic en un ícono si está cerrado
          onClick={() => {
            if (!sidebarExpanded) {
              setSidebarExpanded(true);
            }
          }}
          className={`block truncate transition duration-150 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
        >
          <div className="flex items-center">
            <svg className={`shrink-0 fill-current ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              {icon}
            </svg>
            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              {label}
            </span>
          </div>
        </NavLink>
      </li>
    );
  };

  return (
    <div className="min-w-fit">
      {/* Backdrop mobile */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-900 p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } rounded-r-2xl shadow-sm border-r border-gray-100 dark:border-gray-800`}
      >
        {/* Header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>

          {/* Logo ARES */}
          <NavLink end to="/" className="block">
            <div className="flex items-center gap-2">
              <svg className="fill-blue-600 dark:fill-blue-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width={32} height={32}>
                <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
              </svg>
              <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 font-bold text-gray-800 dark:text-gray-100 tracking-wide text-sm">
                ARES
              </span>
            </div>
          </NavLink>
        </div>

        {/* Nav links */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">•••</span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Sistema ARES</span>
            </h3>
            <ul className="mt-3 space-y-0.5">

              {/* Dashboard */}
              {navItem("/", "Dashboard",
                <><path d="M1 3h6v6H1zM9 3h6v6H9zM1 11h6v4H1zM9 11h6v4H9z"/></>,
                true
              )}

              {/* Telemetría */}
              {navItem("/telemetria", "Telemetría",
                <><path d="M8 0a1 1 0 0 1 1 1v.5a5.5 5.5 0 0 1 4.5 5.5v.5h.5a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2h.5V7A5.5 5.5 0 0 1 7 1.5V1a1 1 0 0 1 1-1ZM4.5 7v.5h7V7a3.5 3.5 0 1 0-7 0ZM6 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z"/></>
              )}

              {/* Robots */}
              {navItem("/robots", "Robots",
                <><path d="M8 0a1 1 0 0 1 1 1v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h1V1a1 1 0 0 1 1-1Zm0 4H6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8ZM6 7a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z"/></>
              )}

              {/* Sensores */}
              {navItem("/sensores", "Sensores",
                <><path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z"/><path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z"/></>
              )}

              {/* Misiones */}
              {navItem("/misiones", "Misiones",
                <><path d="M14.5 1.5l-5-1.5-4 2-4-2v11.5l4 2 4-2 5 1.5v-11.5zM6.5 12.5l-4-2v-8.5l4 2v8.5zm5-1.5l-4 2v-8.5l4-2v8.5zm4 2l-3-1v-8.5l3 1v8.5z"/></>
              )}

            </ul>
          </div>
        </div>

        {/* Botón expandir/colapsar */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className={`shrink-0 fill-current transition-transform duration-200 ${sidebarExpanded ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;