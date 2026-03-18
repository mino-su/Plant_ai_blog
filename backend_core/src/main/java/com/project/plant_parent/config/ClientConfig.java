package com.project.plant_parent.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.web.client.RestClient;

@Configuration
public class ClientConfig {

    @Value("${spring.flask.api.url}")
    private String flask_api_url; // Flask 서버 URL

    @Value("${nongsaro.api}")
    private String nongsaro_api_url; // 농사로 서버 URL

    @Bean
    public RestClient flaskClient() {
        return RestClient.builder()
                .baseUrl(flask_api_url)
                .defaultHeader("Accept", "application/json")
                .build();

    }

    private XmlMapper xmlMapper() {
        XmlMapper mapper = new XmlMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.registerModule(new JavaTimeModule()); // 날짜 모듈 추가
        return mapper;
    }

    @Bean
    public RestClient publicDataClient() {
        return RestClient.builder()
                .baseUrl(nongsaro_api_url)
                .defaultHeader("Accept", "application/xml, text/xml")
                .messageConverters(converters ->
                        converters.add(0, new MappingJackson2XmlHttpMessageConverter(xmlMapper()))
                )
                .build();
    }
}
