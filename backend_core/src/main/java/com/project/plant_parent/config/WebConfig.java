package com.project.plant_parent.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173") // 리액트 기본 포트 (Vite 기준)
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("Authorization", "Content-Type")
                .exposedHeaders("Custom-Header")
                .allowCredentials(true)
                .maxAge(3600);
    }



    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. 현재 프로젝트 폴더 + /uploads/ 경로 지정
        // Mac 결과 예시: /Users/yourname/IdeaProjects/demo/uploads/
        String uploadPath = System.getProperty("user.dir") + "/uploads/";

        // 2. [핵심] 운영체제에 맞춰서 올바른 URL 형태로 자동 변환 (toUri)
        // Mac 결과 예시: file:///Users/yourname/IdeaProjects/demo/uploads/
        String resourcePath = Paths.get(uploadPath).toUri().toString();

        // 3. 로그로 실제 적용된 경로 확인
        System.out.println(">>> [WebConfig] 리소스 매핑 경로: " + resourcePath);

        registry.addResourceHandler("/images/**")
                .addResourceLocations(resourcePath);
    }
}
