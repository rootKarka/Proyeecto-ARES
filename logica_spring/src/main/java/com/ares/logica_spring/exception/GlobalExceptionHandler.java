package com.ares.logica_spring.exception;

import com.ares.logica_spring.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Manejador global de excepciones.
 * Intercepta cualquier error lanzado en los controladores y lo convierte
 * en una respuesta JSON estructurada con el código HTTP correcto.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Captura errores de validación de @Valid en los DTOs de entrada.
     * Por ejemplo, si llega tipo=null o valor=null.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        // Recopila todos los mensajes de error de los campos inválidos
        String mensajes = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> "'" + e.getField() + "': " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Datos de entrada inválidos",
            mensajes
        );

        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Captura cualquier excepción no controlada que escape de los servicios o controladores.
     * Evita que Spring devuelva un stacktrace HTML a Django.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Error interno del servidor",
            ex.getMessage() != null ? ex.getMessage() : "Error inesperado"
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
