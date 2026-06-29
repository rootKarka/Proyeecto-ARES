import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { X, RefreshCw } from "lucide-react";
import { API, withSede } from "../config/api";

const robotIcon = new L.Icon({
  iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Mueve el mapa suavemente hacia la nueva posición cuando cambia
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function RobotMapModal({ robot, onClose }) {
  const [coords, setCoords] = useState({
    lat: parseFloat(robot.latitud),
    lng: parseFloat(robot.longitud),
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervaloRef = useRef(null);

  const tieneCoordenadas = !isNaN(coords.lat) && !isNaN(coords.lng) && (coords.lat !== 0 || coords.lng !== 0);

  // Polling: cada 5 segundos pregunta a Django si las coordenadas cambiaron
  useEffect(() => {
    const fetchUbicacion = async () => {
      try {
        const res = await fetch(`${API.robots}${robot.id}/`);
        if (!res.ok) return;
        const data = await res.json();
        const nuevaLat = parseFloat(data.latitud);
        const nuevaLng = parseFloat(data.longitud);

        // Solo actualiza el estado si la posición realmente cambió
        if (nuevaLat !== coords.lat || nuevaLng !== coords.lng) {
          setCoords({ lat: nuevaLat, lng: nuevaLng });
          setLastUpdate(new Date());
        }
      } catch {
        // silencioso, no interrumpir el mapa por un fallo puntual de red
      }
    };

    intervaloRef.current = setInterval(fetchUbicacion, 5000);
    return () => clearInterval(intervaloRef.current);
  }, [robot.id, coords.lat, coords.lng]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              Ubicación de {robot.nombre}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-400 font-mono">
                {tieneCoordenadas ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Sin señal GPS"}
              </p>
              <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En vivo
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="h-[400px]">
          {tieneCoordenadas ? (
            <MapContainer center={[coords.lat, coords.lng]} zoom={17} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[coords.lat, coords.lng]} icon={robotIcon}>
                <Popup>
                  <strong>{robot.nombre}</strong><br />
                  Actualizado: {lastUpdate.toLocaleTimeString("es-PE")}
                </Popup>
              </Marker>
              <RecenterMap lat={coords.lat} lng={coords.lng} />
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-center px-6">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Este robot todavía no ha enviado coordenadas GPS válidas.
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-gray-100 dark:border-gray-700
                        flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <RefreshCw size={11} /> Actualizando cada 5 segundos
          </span>
          <span>Última señal: {lastUpdate.toLocaleTimeString("es-PE")}</span>
        </div>
      </div>
    </div>
  );
}