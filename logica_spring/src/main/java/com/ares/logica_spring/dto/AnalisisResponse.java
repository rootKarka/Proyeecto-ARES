package com.ares.logica_spring.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnalisisResponse {
    private String nivel;
    private String tipo;
    private String mensaje;

    public AnalisisResponse() {
    }

    public AnalisisResponse(String nivel, String mensaje) {
        this.nivel = nivel;
        this.mensaje = mensaje;
    }

    public AnalisisResponse(String nivel, String tipo, String mensaje) {
        this.nivel = nivel;
        this.tipo = tipo;
        this.mensaje = mensaje;
    }

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
        this.nivel = nivel;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
