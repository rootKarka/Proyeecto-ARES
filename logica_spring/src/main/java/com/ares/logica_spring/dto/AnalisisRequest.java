package com.ares.logica_spring.dto;

public class AnalisisRequest {
    private String tipo;
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
