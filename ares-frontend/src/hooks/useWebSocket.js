import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url) => {
    // Aquí guardaremos las notificaciones que vayan llegando
    const [notificacionesEnVivo, setNotificacionesEnVivo] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let isCancelled = false; // bandera para evitar reconexiones fantasma (StrictMode)
        const socket = new WebSocket(url);

        socket.onopen = () => {
            if (isCancelled) return;
            console.log('✅ Conectado al WebSocket de ARES:', url);
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            if (isCancelled) return;
            const data = JSON.parse(event.data);
            console.log('📩 Nueva notificación:', data);
            setNotificacionesEnVivo((prev) => [data, ...prev]);
        };

        socket.onclose = (event) => {
            if (isCancelled) return;
            console.log(`❌ Desconectado del WebSocket (code=${event.code}, reason=${event.reason || 'sin razón'})`);
            setIsConnected(false);
        };

        socket.onerror = (error) => {
            console.error('⚠️ Error en la conexión WebSocket:', error);
        };

        // Limpieza segura: evita cerrar un socket que aún está "CONNECTING"
        return () => {
            isCancelled = true;
            if (socket.readyState === WebSocket.CONNECTING) {
                socket.onopen = () => socket.close();
            } else if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [url]);

    return { notificacionesEnVivo, isConnected };
};