package com.ares.logica_spring.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controlador de estado del microservicio.
 * Django puede llamar a GET /api/health antes de enviar datos
 * para verificar que Spring Boot esté en línea y respondiendo.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("estado", "OK");
        status.put("servicio", "logica_spring");
        status.put("timestamp", LocalDateTime.now().toString());
        status.put("mensaje", "Microservicio de análisis de sensores ARES operativo");
        return ResponseEntity.ok(status);
    }
}
