package com.project.plant_parent.service;

import com.project.plant_parent.entity.dto.FlaskResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
@RequiredArgsConstructor
public class FlaskService {
    private final RestTemplate restTemplate;

    @Value("${spring.flask.api.url}")
    private String flask_api_url; // Flask 서버 URL

    @Value("${file.upload-dir}")
    private String uploadDir;


    public FlaskResponseDto analyzeImage(String customFilename){
        // 다른 서버와 통신하기 위해 객체 생성(TODO: 나중에 websocket으로 변경예정)

        // 헤더 설정: 지금 보내는 데이터는 파일(Multipart) 형태라고 명시
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

        // 바디 설정: 실제 파일 데이터를 담을 바구니
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // 실제 컨데이터 내부 경로에서 파일 찾기
        Path path = Paths.get(uploadDir, customFilename);
        File file = path.toFile();

        if (!file.exists()) {
            throw new RuntimeException("분석할 파일이 존재하지 않습니다." + customFilename);
        }

        body.add("image", new FileSystemResource(file));


        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, httpHeaders);
        String flaskUrl = flask_api_url + "/detect";

        try {
            log.info(">>> Flask 서버로 분석 요청중 : {}", customFilename);
            return restTemplate.postForObject(flaskUrl, requestEntity, FlaskResponseDto.class);
        } catch (Exception e) {
            log.error(">>> Flask 서버와 통신 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("AI 서버 분석 실패.", e);
        }


    }
}
