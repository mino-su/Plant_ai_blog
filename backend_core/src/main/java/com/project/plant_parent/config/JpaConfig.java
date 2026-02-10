package com.project.plant_parent.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing // @EntityListeners(AuditingEntityListener.class) 활성화
@Configuration
public class JpaConfig {
}
