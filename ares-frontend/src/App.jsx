import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Telemetria from './pages/Telemetria';
import Robots from './pages/Robots';
import Sensors from './pages/Sensors';
import Misiones from './pages/Misiones'; // <--- 1. LÍNEA NUEVA

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="telemetria" element={<Telemetria />} />
          <Route path="robots" element={<Robots />} />
          <Route path="sensores" element={<Sensors />} /> 
          <Route path="misiones" element={<Misiones />} /> {/* <--- 2. LÍNEA NUEVA */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;