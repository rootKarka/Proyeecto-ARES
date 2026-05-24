#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 14        // Pin donde conectaste el DHT11
#define DHTTYPE DHT11

const char* ssid = "TU WIFI";
const char* password = "TU PASSWORD";

// URL de tu servidor Django
const char* serverName = "http://192.168.1.36:8000/api/lecturas/";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  dht.begin();

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }

  Serial.println("Conectado!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float temperatura = dht.readTemperature();

    if (isnan(temperatura)) {
      Serial.println("Error leyendo temperatura");
      return;
    }

    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"valor\":" + String(temperatura) + 
              ",\"estado_procesamiento\":false,\"sensor\":1}";

    int httpResponseCode = http.POST(json);

    Serial.print("Codigo HTTP: ");
    Serial.println(httpResponseCode);

    http.end();
  }

  delay(5000);
}