import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Asegúrate de que la ruta importe correctamente tu componente

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#0A0A0A] text-[#E8E8E8] font-sans antialiased">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal con scroll */}
      <main className="flex-1 overflow-y-auto bg-[#0C0D11]">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;