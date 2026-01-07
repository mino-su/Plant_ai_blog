package com.project.plant_parent.service;

import com.project.plant_parent.entity.dto.FlaskResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Slf4j
public class FlaskService {

    @Value("${spring.flask.api.url}")
    private String flask_api_url; // Flask 서버 URL

    // 분석 결과를 받아올 dto
    public FlaskResponseDto analyzeImage(MultipartFile image, String customFilename){
        // 다른 서버와 통신하기 위해 객체 생성(TODO: 나중에 websocket으로 변경예정)
        RestTemplate restTemplate = new RestTemplate();

        // 헤더 설정: 지금 보내는 데이터는 파일(Multipart) 형태라고 명시
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

        // 바디 설정: 실제 파일 데이터를 담을 바구니
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        try{
            // MultipartTile의 이름을 customFilename으로 교체
            // ByteArrayResource를 상속받아 getFilename()만 우리가 원하는 이름으로 바꿈
            ByteArrayResource contentsAsResource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return customFilename;
                }
            };

            body.add("image", contentsAsResource);

        } catch (IOException e) {
            throw new RuntimeException("이미지 처리 중 오류가 발생했습니다.", e);
        }

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, httpHeaders);
        String flaskUrl = flask_api_url + "/detect";

        // [개선] 한 번만 호출하고 바로 DTO로 받습니다.
        // 로그가 필요하다면 이 결과값을 toString()으로 찍으면 됩니다.
        FlaskResponseDto response = restTemplate.postForObject(flaskUrl, requestEntity, FlaskResponseDto.class);

        log.info("Flask 응답 결과: {}", response); // log를 사용하거나 System.out 사용
        return response;


    }
}
