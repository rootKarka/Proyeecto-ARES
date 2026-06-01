package com.ares.logica_spring.service;

import com.ares.logica_spring.dto.AnalisisRequest;
import com.ares.logica_spring.dto.AnalisisResponse;
import org.springframework.stereotype.Service;

@Service
public class AnalisisService {

    // Niveles compatibles con Django (NIVEL_CHOICES)
    private static final String NORMAL = "NORMAL";
    private static final String INFO = "INFO";
    private static final String ADVERTENCIA = "ADVERTENCIA";
    private static final String CRITICO = "CRITICO";
    private static final String EMERGENCIA = "EMERGENCIA";

    public AnalisisResponse analizarLectura(AnalisisRequest request) {
        if (request.getTipo() == null || request.getValor() == null) {
            return new AnalisisResponse(NORMAL, "Datos incompletos");
        }

        String tipo = request.getTipo().toUpperCase();
        double valor = request.getValor();

        // 1. LÓGICA PARA GASES TOXICOS (Ej. Monóxido de Carbono)
        if ("GAS".equals(tipo)) {
            if (valor > 150) { // Umbral peligroso a los pocos minutos
                return new AnalisisResponse(
                    CRITICO,
                    "GAS_TOXICO",
                    "¡CRÍTICO! Fuga de gas peligroso detectada (" + String.format("%.1f", valor) + " ppm)"
                );
            } else if (valor > 50) { // Supera el límite permisible de salud (OSHA)
                return new AnalisisResponse(
                    ADVERTENCIA,
                    "GAS_TOXICO",
                    "Advertencia: Nivel de gas inusual registrado (" + String.format("%.1f", valor) + " ppm)"
                );
            } else {
                return new AnalisisResponse(NORMAL, "Nivel de gas normal");
            }
        } 

         // 2. LÓGICA PARA TEMPERATURA AMBIENTAL HABITABLE
        else if ("TEMPERATURA".equals(tipo)) {
            if (valor > 42.0) { // Umbral donde el cuerpo humano sufre daños severos rápidamente
                return new AnalisisResponse(
                    EMERGENCIA,
                    "TEMPERATURA_ALTA",
                    "¡EMERGENCIA! Posible incendio o calor extremo detectado (" + String.format("%.1f", valor) + " °C)"
                );
            } else if (valor > 35.0) { // Inicio de riesgo por golpe de calor extremo
                return new AnalisisResponse(
                    ADVERTENCIA,
                    "TEMPERATURA_ALTA",
                    "Advertencia: Temperatura elevada detectada (" + String.format("%.1f", valor) + " °C)"
                );
            } else {
                return new AnalisisResponse(NORMAL, "Temperatura normal");
            }
        } 

        // 3. LÓGICA PARA SONIDO (Ej. Ruido de gritos o impactos fuertes
        else if ("SONIDO".equals(tipo)) {
            if (valor > 100.0) { // Umbral de ruido extremadamente alto (similar a un grito fuerte o impacto)
                return new AnalisisResponse(
                    EMERGENCIA, // Escalado a emergencia por la gravedad del sonido
                    "VICTIMA_POSIBLE",
                    "¡CRÍTICO! Ruido extremadamente alto (Posible grito o impacto) (" + String.format("%.1f", valor) + " dB)"
                );
            } else if (valor > 75) { // Ruido molesto o inusual para un entorno cerrado (tráfico pesado, discusiones)
                return new AnalisisResponse(
                    INFO,
                    "VICTIMA_POSIBLE",
                    "Info: Ruido inusual detectado en la zona (" + String.format("%.1f", valor) + " dB)"
                );
            } else {
                return new AnalisisResponse(NORMAL, "Nivel de ruido normal");
            }
        } 
        else {
            return new AnalisisResponse(NORMAL, "Condiciones normales");
        }
    }
}
