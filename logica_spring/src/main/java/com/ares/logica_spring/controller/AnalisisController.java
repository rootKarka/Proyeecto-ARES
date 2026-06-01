package com.ares.logica_spring.controller;

import com.ares.logica_spring.dto.AnalisisRequest;
import com.ares.logica_spring.dto.AnalisisResponse;
import com.ares.logica_spring.service.AnalisisService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AnalisisController {

    private final AnalisisService analisisService;

    // Inyección de dependencias por constructor (patrón recomendado en Spring)
    public AnalisisController(AnalisisService analisisService) {
        this.analisisService = analisisService;
    }

    @PostMapping("/analizar")
    public AnalisisResponse analizar(@RequestBody AnalisisRequest request) {
        return analisisService.analizarLectura(request);
    }
}
