package com.ares.cerebro.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class AnalisisController {

    @PostMapping("/analizar")
    public Map<String, String> analizar(@RequestBody Map<String, Object> data) {

        String tipo = (String) data.get("tipo");
        int valor = (int) data.get("valor");

        Map<String, String> response = new HashMap<>();

        if ("gas".equals(tipo) && valor > 300) {
            response.put("nivel", "critico");
            response.put("mensaje", "Gas peligroso detectado");
        } else {
            response.put("nivel", "normal");
            response.put("mensaje", "Todo en orden");
        }

        return response;
    }
}