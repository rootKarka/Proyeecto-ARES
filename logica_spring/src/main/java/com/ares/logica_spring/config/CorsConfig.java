package com.ares.logica_spring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración CORS para permitir que el backend Django (u otras fuentes)
 * puedan llamar a este microservicio sin errores de origen cruzado.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Permite solicitudes desde el servidor Django (ajusta el puerto si cambia)
                .allowedOrigins(
                    "http://localhost:8000",
                    "http://127.0.0.1:8000"
                )
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600); // Cache de la pre-flight request por 1 hora
    }
}
