package com.ares.logica_spring.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Umbrales de detección de sensores cargados desde application.properties.
 * Esto permite ajustar los límites sin necesidad de recompilar el proyecto.
 */
@Component
@ConfigurationProperties(prefix = "ares.umbrales")
public class UmbralesConfig {

    // Valores por defecto de los umbrales para cada tipo de sensor
    private Gas gas = new Gas();
    private Temperatura temperatura = new Temperatura();
    private Sonido sonido = new Sonido();

    // Getters y Setters de nivel superior 

    public Gas getGas() { return gas; }
    public void setGas(Gas gas) { this.gas = gas; }

    public Temperatura getTemperatura() { return temperatura; }
    public void setTemperatura(Temperatura temperatura) { this.temperatura = temperatura; }

    public Sonido getSonido() { return sonido; }
    public void setSonido(Sonido sonido) { this.sonido = sonido; }

    // Clases internas de configuración 

    public static class Gas {
        private double critico = 300.0;
        private double advertencia = 150.0;

        public double getCritico() { return critico; }
        public void setCritico(double critico) { this.critico = critico; }

        public double getAdvertencia() { return advertencia; }
        public void setAdvertencia(double advertencia) { this.advertencia = advertencia; }
    }

    public static class Temperatura {
        private double emergencia = 50.0;
        private double advertencia = 35.0;

        public double getEmergencia() { return emergencia; }
        public void setEmergencia(double emergencia) { this.emergencia = emergencia; }

        public double getAdvertencia() { return advertencia; }
        public void setAdvertencia(double advertencia) { this.advertencia = advertencia; }
    }

    public static class Sonido {
        private double critico = 80.0;
        private double info = 65.0;

        public double getCritico() { return critico; }
        public void setCritico(double critico) { this.critico = critico; }

        public double getInfo() { return info; }
        public void setInfo(double info) { this.info = info; }
    }
}
