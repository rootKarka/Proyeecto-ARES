import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Robots from './pages/Robots';
import Sensors from './pages/Sensors'; // <--- LÍNEA NUEVA

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout es la plantilla que contiene el Sidebar. Todo lo de adentro cambia */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="robots" element={<Robots />} />
          <Route path="sensores" element={<Sensors />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;