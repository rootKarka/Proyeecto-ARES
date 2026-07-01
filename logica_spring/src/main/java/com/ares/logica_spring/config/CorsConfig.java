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
                // Permite solicitudes desde Django en local y en producción (Render)
                .allowedOrigins(
                    "http://localhost:8000",
                    "http://127.0.0.1:8000",
                    "https://proyeecto-ares.onrender.com",    // Django en Render (producción)
                    "https://proyeecto-ares-1.onrender.com"   // URL alternativa de Render
                )
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600); // Cache de la pre-flight request por 1 hora
    }
}
