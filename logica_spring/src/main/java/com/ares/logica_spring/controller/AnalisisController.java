package com.ares.logica_spring.controller;

import com.ares.logica_spring.dto.AnalisisRequest;
import com.ares.logica_spring.dto.AnalisisResponse;
import com.ares.logica_spring.service.AnalisisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para el análisis de sensores.
 * Recibe datos del backend Django, delega el análisis al servicio
 * y expone el historial de los últimos análisis realizados.
 */
@RestController
@RequestMapping("/api")
public class AnalisisController {

    private final AnalisisService analisisService;

    // Inyección por constructor (patrón recomendado en Spring)
    public AnalisisController(AnalisisService analisisService) {
        this.analisisService = analisisService;
    }

    /**
     * POST /api/analizar
     * Analiza una lectura de sensor y retorna el nivel de alerta.
     * @Valid activa la validación del DTO antes de llegar al servicio.
     */
    @PostMapping("/analizar")
    public ResponseEntity<AnalisisResponse> analizar(@Valid @RequestBody AnalisisRequest request) {
        AnalisisResponse respuesta = analisisService.analizarLectura(request);
        return ResponseEntity.ok(respuesta);
    }

    /**
     * GET /api/historial
     * Retorna los últimos análisis realizados (máx. configurado en application.properties).
     * Útil para monitoreo en tiempo real sin necesidad de base de datos.
     */
    @GetMapping("/historial")
    public ResponseEntity<List<Map<String, Object>>> historial() {
        return ResponseEntity.ok(analisisService.getHistorial());
    }
}
