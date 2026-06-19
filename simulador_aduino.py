import time
import random
import sys
import requests

# Configuración de URLs locales de los servicios
DJANGO_URL = "http://localhost:8000"
SPRING_BOOT_URL = "http://localhost:8080/api/analizar"

def comprobar_servicios():
    print("=" * 60)
    print("🤖 INICIANDO SIMULADOR ARDUINO / ESP32 PARA ARES 🤖")
    print("=" * 60)
    
    # 1. Comprobar Django
    print("\n🔍 Comprobando conexión con backend de Django...")
    try:
        res = requests.get(f"{DJANGO_URL}/api/robots/", timeout=2)
        if res.status_code == 200:
            print("✅ Django: ONLINE (Puerto 8000)")
        else:
            print(f"⚠️ Django respondió con código: {res.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Django: OFFLINE. Asegúrate de ejecutar 'python manage.py runserver'")
        sys.exit(1)

    # 2. Comprobar Spring Boot
    print("🔍 Comprobando conexión con microservicio Spring Boot...")
    try:
        res = requests.post(SPRING_BOOT_URL, json={"tipo": "gas", "valor": 100}, timeout=2)
        if res.status_code == 200:
            print("✅ Spring Boot: ONLINE (Puerto 8080)")
        else:
            print(f"⚠️ Spring Boot respondió con código: {res.status_code}")
    except requests.exceptions.ConnectionError:
        print("⚠️ Spring Boot: OFFLINE (Puerto 8080). El simulador funcionará, pero no se generarán alertas en base a Spring Boot.")

def obtener_o_crear_robot_y_sensores():
    print("\n📦 Configurando flota y sensores simulados...")
    
    # 1. Buscar o crear Robot
    res_robots = requests.get(f"{DJANGO_URL}/api/robots/").json()
    robot_activo = None
    
    # Intentar buscar un robot activo disponible o crear uno nuevo
    for r in res_robots:
        if r["estado"] == "Activo" or r["estado"] == "DISPONIBLE":
            robot_activo = r
            break
            
    if not robot_activo:
        print("🤖 No se encontró ningún robot. Creando uno de prueba: 'ARES-Alpha-Simulado'...")
        robot_data = {
            "nombre": "ARES-Alpha-Simulado",
            "estado": "DISPONIBLE",
            "mac_address": "00:1A:2B:3C:4D:5E",
            "bateria_nivel": 95.0,
            "bateria_voltaje": 12.4,
            "latitud": -12.046374, # Coordenadas de prueba en Lima
            "longitud": -77.042793,
            "horas_uso": 1.5
        }
        res_create = requests.post(f"{DJANGO_URL}/api/robots/", json=robot_data)
        if res_create.status_code == 201:
            robot_activo = res_create.json()
            print(f"✅ Robot creado exitosamente con ID: {robot_activo['id']}")
        else:
            print("❌ Error creando robot:", res_create.text)
            sys.exit(1)
    else:
        print(f"✅ Usando robot existente: '{robot_activo['nombre']}' (ID: {robot_activo['id']})")

    # 2. Buscar o crear sensores vinculados al robot
    res_sensores = requests.get(f"{DJANGO_URL}/api/sensores/").json()
    sensores_del_robot = [s for s in res_sensores if s["robot"] == robot_activo["id"]]
    
    sensores_necesarios = [
        {"tipo": "TEMPERATURA", "modelo": "DHT22", "unidad": "°C", "umbral_critico": 50.0},
        {"tipo": "GAS", "modelo": "MQ135", "unidad": "ppm", "umbral_critico": 300.0},
        {"tipo": "SONIDO", "modelo": "KY-037", "unidad": "dB", "umbral_critico": 70.0}
    ]
    
    sensores_finales = []
    
    for req in sensores_necesarios:
        encontrado = None
        for s in sensores_del_robot:
            if s["tipo"] == req["tipo"]:
                encontrado = s
                break
        
        if not encontrado:
            print(f"⚡ Creando sensor simulado '{req['tipo']}' para el robot ID {robot_activo['id']}...")
            sensor_data = {
                "robot": robot_activo["id"],
                "tipo": req["tipo"],
                "modelo": req["modelo"],
                "unidad": req["unidad"],
                "umbral_critico": req["umbral_critico"],
                "activo": True
            }
            res_create_sensor = requests.post(f"{DJANGO_URL}/api/sensores/", json=sensor_data)
            if res_create_sensor.status_code == 201:
                sensores_finales.append(res_create_sensor.json())
                print(f"   ✅ Sensor {req['tipo']} creado.")
            else:
                print("   ❌ Error creando sensor:", res_create_sensor.text)
        else:
            sensores_finales.append(encontrado)
            print(f"✅ Sensor existente encontrado: {encontrado['tipo']} (ID: {encontrado['id']})")
            
    return robot_activo, sensores_finales

def obtener_total_alertas():
    try:
        res = requests.get(f"{DJANGO_URL}/api/alertas/", timeout=2)
        if res.status_code == 200:
            return len(res.json()), res.json()
    except Exception:
        pass
    return 0, []

def ejecutar_simulacion(robot, sensores):
    print("\n" + "=" * 60)
    print("🚀 INICIANDO TRANSMISIÓN DE TELEMETRÍA EN BUCLE 🚀")
    print("Envío de datos simulados cada 5 segundos.")
    print("Ocasionalmente se inyectarán anomalías críticas para testear alertas de Spring.")
    print("=" * 60 + "\n")
    
    # Coordenadas base
    # Configura dónde está parado el robot
    lat_base = float(robot["latitud"]) if robot["latitud"] else -12.046374
    lon_base = float(robot["longitud"]) if robot["longitud"] else -77.042793
    # Si el robot ya tiene una ubicación guardada, la usa. Si no tiene ninguna, el código le asigna unas coordenadas por defecto (que corresponden a Lima, Perú).
    
    ciclo = 0
    while True:
        ciclo += 1
        print(f"📋 [Ciclo #{ciclo}] Generando telemetría...")
        
        # Desplazamiento dinámico leve de GPS (simula movimiento del robot en circulos pequeños)
        lat_base += random.uniform(-0.0001, 0.0001)
        lon_base += random.uniform(-0.0001, 0.0001)
        
        # Guardar el número de alertas previas
        alertas_previas_count, alertas_previas = obtener_total_alertas()

        # Determinar si en este ciclo inyectamos un valor peligroso es decir Planea un "accidente" programado.
        inyectar_anomalia = (ciclo % 4 == 0)
        
        for sensor in sensores:
            tipo_sensor = sensor["tipo"]
            sensor_id = sensor["id"]
            
            # Generar datos simulados
            valor = 0.0
            if tipo_sensor == "TEMPERATURA":
                if inyectar_anomalia:
                    valor = random.uniform(55.0, 75.0)  # > 50 °C (Nivel ALTO)
                    print(f"🔥 [ANOMALÍA] Generando Temperatura Elevada: {valor:.1f}°C")
                else:
                    valor = random.uniform(22.0, 28.0)  # Normal
            
            elif tipo_sensor == "GAS":
                if inyectar_anomalia:
                    valor = random.uniform(320.0, 500.0) # > 300 ppm (Nivel CRÍTICO)
                    print(f"☣️ [ANOMALÍA] Generando Fuga de Gas Tóxico: {valor:.1f} ppm")
                else:
                    valor = random.uniform(80.0, 150.0)  # Normal
            
            elif tipo_sensor == "SONIDO":
                if inyectar_anomalia:
                    valor = random.uniform(75.0, 95.0)  # > 70 dB (Nivel MEDIO)
                    print(f"🔊 [ANOMALÍA] Generando Ruido Sospechoso: {valor:.1f} dB")
                else:
                    valor = random.uniform(35.0, 50.0)  # Ruido normal ambiente
            
            else:
                valor = random.uniform(10.0, 50.0)
                
            # JSON que el Arduino enviaría por HTTP POST a Django
            lectura_payload = {
                "sensor": sensor_id,
                "robot": robot["id"],
                "valor": valor,
                "valor_raw": valor * 1.024, # Ejemplo de mapeo raw
                "latitud": round(lat_base, 7),
                "longitud": round(lon_base, 7),
                "estado_procesamiento": False,
                "nivel_alerta": "NORMAL"
            }
            
            # Enviar lectura a Django, es decir, simular el POST que haría el Arduino al backend de Django
            try:
                endpoint = f"{DJANGO_URL}/api/lecturas/"
                res_post = requests.post(endpoint, json=lectura_payload, timeout=3)
                
                if res_post.status_code == 201:
                    print(f"   📡 Enviado con éxito -> Sensor: {tipo_sensor:<12} | Valor: {valor:6.1f} {sensor['unidad']} | GPS: {lat_base:.6f}, {lon_base:.6f}")
                else:
                    print(f"   ❌ Error al enviar lectura del sensor {tipo_sensor}: {res_post.status_code} - {res_post.text}")
            except Exception as e:
                print(f"   ❌ Error de conexión al enviar lectura del sensor {tipo_sensor}: {e}")
        
        # Pequeña pausa para dar tiempo a que termine el hilo asíncrono en Django que llama a Spring Boot
        time.sleep(1.0)
        
        # Verificar si se generó una nueva alerta en la base de datos de Django
        alertas_nuevas_count, alertas_nuevas = obtener_total_alertas()
        if alertas_nuevas_count > alertas_previas_count:
            diferencia = alertas_nuevas_count - alertas_previas_count
            print(f"\n🚨🚨 [ALERTA GENERADA EN DJANGO POR SPRING BOOT] 🚨🚨")
            # Listar las nuevas alertas
            for i in range(diferencia):
                alerta = alertas_nuevas[-(i+1)]
                print(f"   🔴 [{alerta.get('nivel')}] -> Mensaje: {alerta.get('mensaje')}")
            print()
        elif inyectar_anomalia:
            print("\n⚠️ [Spring Boot / Alertas] Se inyectó anomalía pero no se registró una nueva alerta.")
            print("Asegúrate de que Spring Boot esté encendido en http://localhost:8080\n")
            
        print("-" * 60)
        time.sleep(4.0)

if __name__ == "__main__":
    try:
        comprobar_servicios()
        robot, sensores = obtener_o_crear_robot_y_sensores()
        ejecutar_simulacion(robot, sensores)
    except KeyboardInterrupt:
        print("\n\n👋 Simulador detenido por el usuario. ¡Hasta luego!")
        sys.exit(0)