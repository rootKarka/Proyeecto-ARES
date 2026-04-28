package com.ares.logica_spring.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class AnalisisController {

    private static final String BAJO = "bajo";
    private static final String MEDIO = "medio";
    private static final String ALTO = "alto";
    private static final String CRITICO = "critico";

    @PostMapping("/analizar")
    public Map<String, String> analizar(@RequestBody Map<String, Object> data) {

        Map<String, String> response = new HashMap<>();

        //VALIDACIÓN DE CAMPOS
        if (!data.containsKey("tipo") || !data.containsKey("valor")) {
            response.put("nivel", BAJO);
            response.put("mensaje", "Datos incompletos");
            return response;
        }

        String tipo = data.get("tipo").toString();
        double valor;

        try {
    valor = ((Number) data.get("valor")).doubleValue();
        } catch (Exception e) {
            response.put("nivel", BAJO);
            response.put("mensaje", "Valor inválido");
            return response;
        }

        //Logica de las reglas
        if ("gas".equals(tipo) && valor > 300) {
            response.put("nivel", CRITICO);
            response.put("mensaje", "Gas peligroso detectado");
        } 
        else if ("temperatura".equals(tipo) && valor > 50) {
            response.put("nivel", ALTO);
            response.put("mensaje", "Temperatura elevada detectada");
        } 
        else if ("sonido".equals(tipo) && valor > 70) {
            response.put("nivel", MEDIO);
            response.put("mensaje", "Ruido sospechoso detectado");
        } 
        else {
            response.put("nivel", BAJO);
            response.put("mensaje", "Condiciones normales");
        }

        return response;
    }
}
