package com.ares.logica_spring.dto;

import java.time.LocalDateTime;

/**
 * DTO de respuesta estándar para errores HTTP.
 * Garantiza que cualquier fallo devuelva un JSON limpio y coherente
 * en lugar de un stacktrace HTML crudo de Spring Boot.
 */
public class ErrorResponse {

    private int status;
    private String error;
    private String mensaje;
    private LocalDateTime timestamp;

    public ErrorResponse(int status, String error, String mensaje) {
        this.status = status;
        this.error = error;
        this.mensaje = mensaje;
        this.timestamp = LocalDateTime.now();
    }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
