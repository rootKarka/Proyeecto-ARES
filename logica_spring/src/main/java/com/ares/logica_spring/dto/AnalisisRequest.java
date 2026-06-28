package com.ares.logica_spring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de entrada para el análisis de sensores.
 * Las anotaciones @NotNull y @NotBlank garantizan que el JSON
 * de entrada sea válido antes de llegar al servicio.
 */
public class AnalisisRequest {

    @NotBlank(message = "El campo 'tipo' es obligatorio y no puede estar vacío")
    private String tipo;

    @NotNull(message = "El campo 'valor' es obligatorio")
    private Double valor;

    public AnalisisRequest() {
    }

    public AnalisisRequest(String tipo, Double valor) {
        this.tipo = tipo;
        this.valor = valor;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }
}
