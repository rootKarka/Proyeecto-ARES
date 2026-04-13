import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Radio,
  ShieldAlert,
  Cpu,
} from 'lucide-react';

const Sidebar = () => {
  // Ahora solo mostramos lo que realmente existe en nuestro backend
  const navItems = [
    { to: '/', label: 'Telemetría', icon: LayoutDashboard },
    { to: '/robots', label: 'Robots', icon: Bot },
    { to: '/sensores', label: 'Sensores', icon: Cpu }, // <--- LÍNEA NUEVA
  ];

  return (
    <aside className="w-64 h-screen bg-[#0A0A0A] border-r border-[#2C2F3B] flex flex-col">
      {/* Header del Sidebar */}
      <div className="p-6 border-b border-[#2C2F3B]">
        <div className="flex items-center gap-3">
          <div className="bg-[#1F70C1] p-2 rounded-lg">
            <ShieldAlert className="text-[#E8E8E8]" size={24} />
          </div>
          <div>
            <h1 className="text-[#E8E8E8] font-bold tracking-wider text-xl">
              ARES
            </h1>
            <p className="text-[#1F70C1] text-xs font-mono tracking-tight">
              C2 TACTICAL
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#1F70C1] text-[#E8E8E8] shadow-lg shadow-blue-900/20'
                    : 'text-[#E8E8E8]/70 hover:bg-[#2C2F3B] hover:text-[#E8E8E8]'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer con estado de conexión */}
      <div className="p-4 border-t border-[#2C2F3B]">
        <div className="flex items-center gap-2 text-sm">
          <Radio size={16} className="text-green-500" />
          <span className="text-[#E8E8E8]/60">SYS.ONLINE</span>
          <span className="ml-auto flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <div className="mt-2 text-[10px] text-[#E8E8E8]/40 font-mono">
          ENLACE SEGURO • AES-256
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;