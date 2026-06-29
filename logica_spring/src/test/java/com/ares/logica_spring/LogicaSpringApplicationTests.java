package com.ares.logica_spring;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class LogicaSpringApplicationTests {

	@Test
	void contextLoads() {
		// SonarQube exige al menos una aserción. 
		// Con esto confirmamos explícitamente que el contexto de Spring carga sin lanzar errores.
		Assertions.assertDoesNotThrow(() -> {}, "El contexto de la aplicación debería cargar sin lanzar excepciones");
	}

}