package com.project.plant_parent.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ClientConfig {

    @Value("${spring.flask.api.url}")
    private String flask_api_url; // Flask 서버 URL

    @Bean
    public RestClient flaskClient() {
        return RestClient.builder()
                .baseUrl(flask_api_url)
                .defaultHeader("Accept", "application/json")
                .build();

    }
}
