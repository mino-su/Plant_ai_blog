package com.project.plant_parent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing // @EntityListeners(AuditingEntityListener.class) 활성화
@SpringBootApplication
public class PlantParentApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlantParentApplication.class, args);
	}

}
