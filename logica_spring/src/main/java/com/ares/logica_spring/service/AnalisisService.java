package com.ares.logica_spring.service;

import com.ares.logica_spring.config.UmbralesConfig;
import com.ares.logica_spring.dto.AnalisisRequest;
import com.ares.logica_spring.dto.AnalisisResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio de análisis de sensores.
 * Contiene toda la lógica de negocio: evaluación de umbrales,
 * logging de análisis e historial de los últimos resultados en memoria.
 */
@Service
public class AnalisisService {

    // Logger para seguimiento de eventos y depuración
    private static final Logger log = LoggerFactory.getLogger(AnalisisService.class);

    // Niveles compatibles con Django (NIVEL_CHOICES)
    private static final String NORMAL     = "NORMAL";
    private static final String INFO       = "INFO";
    private static final String ADVERTENCIA = "ADVERTENCIA";
    private static final String CRITICO    = "CRITICO";
    private static final String EMERGENCIA = "EMERGENCIA";

    private final UmbralesConfig umbrales;

    @Value("${ares.historial.max-entries:50}")
    private int maxEntradas;

    // Historial de análisis en memoria (thread-safe con Deque sincronizado)
    private final Deque<Map<String, Object>> historial = new ArrayDeque<>();

    public AnalisisService(UmbralesConfig umbrales) {
        this.umbrales = umbrales;
    }

    /**
     * Analiza una lectura de sensor y retorna el resultado de la evaluación.
     * El resultado también se guarda en el historial en memoria.
     */
    public AnalisisResponse analizarLectura(AnalisisRequest request) {
        String tipo = request.getTipo().toUpperCase();
        double valor = request.getValor();

        log.info("[ARES] Analizando sensor | tipo={} | valor={}", tipo, valor);

        AnalisisResponse respuesta = evaluar(tipo, valor);

        log.info("[ARES] Resultado | nivel={} | mensaje={}", respuesta.getNivel(), respuesta.getMensaje());

        // Guardar en historial solo si no es NORMAL (o siempre — ajustable)
        guardarEnHistorial(tipo, valor, respuesta);

        return respuesta;
    }

    /**
     * Devuelve una copia inmutable del historial actual.
     */
    public List<Map<String, Object>> getHistorial() {
        synchronized (historial) {
            return new ArrayList<>(historial);
        }
    }

    // ── Lógica de evaluación de umbrales ────────────────────────────────────

    private AnalisisResponse evaluar(String tipo, double valor) {
        return switch (tipo) {
            case "GAS"         -> evaluarGas(valor);
            case "TEMPERATURA" -> evaluarTemperatura(valor);
            case "SONIDO"      -> evaluarSonido(valor);
            default -> {
                log.warn("[ARES] Tipo de sensor desconocido: {}", tipo);
                yield new AnalisisResponse(NORMAL, "Condiciones normales");
            }
        };
    }

    private AnalisisResponse evaluarGas(double valor) {
        if (valor > umbrales.getGas().getCritico()) {
            return new AnalisisResponse(CRITICO, "GAS_TOXICO",
                "¡CRÍTICO! Fuga de gas peligroso detectada (" + fmt(valor) + " ppm)");
        } else if (valor > umbrales.getGas().getAdvertencia()) {
            return new AnalisisResponse(ADVERTENCIA, "GAS_TOXICO",
                "Advertencia: Nivel de gas inusual registrado (" + fmt(valor) + " ppm)");
        }
        return new AnalisisResponse(NORMAL, "Nivel de gas normal");
    }

    private AnalisisResponse evaluarTemperatura(double valor) {
        if (valor > umbrales.getTemperatura().getEmergencia()) {
            return new AnalisisResponse(EMERGENCIA, "TEMPERATURA_ALTA",
                "¡EMERGENCIA! Posible incendio o calor extremo detectado (" + fmt(valor) + " °C)");
        } else if (valor > umbrales.getTemperatura().getAdvertencia()) {
            return new AnalisisResponse(ADVERTENCIA, "TEMPERATURA_ALTA",
                "Advertencia: Temperatura elevada detectada (" + fmt(valor) + " °C)");
        }
        return new AnalisisResponse(NORMAL, "Temperatura normal");
    }

    private AnalisisResponse evaluarSonido(double valor) {
        if (valor > umbrales.getSonido().getCritico()) {
            return new AnalisisResponse(CRITICO, "VICTIMA_POSIBLE",
                "¡CRÍTICO! Ruido extremadamente alto (Posible grito o impacto) (" + fmt(valor) + " dB)");
        } else if (valor > umbrales.getSonido().getInfo()) {
            return new AnalisisResponse(INFO, "VICTIMA_POSIBLE",
                "Info: Ruido inusual detectado en la zona (" + fmt(valor) + " dB)");
        }
        return new AnalisisResponse(NORMAL, "Nivel de ruido normal");
    }

    // ── Utilidades ───────────────────────────────────────────────────────────

    private String fmt(double valor) {
        return String.format("%.1f", valor);
    }

    private synchronized void guardarEnHistorial(String tipo, double valor, AnalisisResponse respuesta) {
        Map<String, Object> entrada = new LinkedHashMap<>();
        entrada.put("timestamp", LocalDateTime.now().toString());
        entrada.put("tipo", tipo);
        entrada.put("valor", valor);
        entrada.put("nivel", respuesta.getNivel());
        entrada.put("mensaje", respuesta.getMensaje());

        historial.addFirst(entrada); // Más reciente primero

        // Limitar el tamaño del historial
        while (historial.size() > maxEntradas) {
            historial.removeLast();
        }
    }
}
