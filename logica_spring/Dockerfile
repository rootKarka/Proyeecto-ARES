# ─────────────────────────────────────────────────────────────────
# Dockerfile — logica_spring (Microservicio ARES de análisis)
# Build multi-stage: compila con Maven y corre con JRE mínimo.
# Compatible con Railway, Render y cualquier plataforma Docker.
# ─────────────────────────────────────────────────────────────────

# ── ETAPA 1: Compilación ─────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copiar el wrapper y el POM primero para cachear las dependencias
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dar permisos al wrapper y descargar dependencias (cacheado si no cambia pom.xml)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B --no-transfer-progress

# Copiar el código fuente y compilar
COPY src ./src
RUN ./mvnw package -DskipTests -B --no-transfer-progress

# ── ETAPA 2: Imagen de ejecución (mínima) ────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar solo el JAR generado desde la etapa de build
COPY --from=build /app/target/*.jar app.jar

# Puerto por defecto (Railway inyecta $PORT automáticamente via application.properties)
EXPOSE 8080

# Flags de JVM para contenedores pequeños (limita heap, reduce overhead)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
