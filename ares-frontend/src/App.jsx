import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout    from "./components/Layout";
import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Telemetria from "./pages/Telemetria";
import Robots    from "./pages/Robots";
import Sensors   from "./pages/Sensors";
import Misiones  from "./pages/Misiones";
import Usuarios  from "./pages/Usuarios";
import Reportes  from "./pages/Reportes";
import Mensajes  from "./pages/Mensajes";

// Ruta protegida: si no hay sesión, redirige al login
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Ruta pública: si ya hay sesión, redirige al dashboard
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/" element={
        <PrivateRoute><Layout /></PrivateRoute>
      }>
        <Route index           element={<Dashboard />} />
        <Route path="telemetria" element={<Telemetria />} />
        <Route path="robots"     element={<Robots />} />
        <Route path="sensores"   element={<Sensors />} />
        <Route path="misiones"   element={<Misiones />} />
        <Route path="usuarios"   element={<Usuarios />} />
        <Route path="reportes"   element={<Reportes />} />
        <Route path="mensajes"   element={<Mensajes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;