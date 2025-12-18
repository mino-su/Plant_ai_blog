package com.project.plant_parent.service;

import com.project.plant_parent.entity.dto.FlaskResponseDto;
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
public class FlaskService {
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

        String flaskUrl = "http://localhost:5000/detect";


        // 1. 일단 String 형태로 날것(Raw)의 응답을 받아옵니다.
        ResponseEntity<String> rawResponse = restTemplate.postForEntity(flaskUrl, requestEntity, String.class);

        // 2. 인텔리제이 콘솔창에 Flask가 보낸 진짜 JSON 모양을 출력합니다.
        System.out.println("========= Flask가 보낸 진짜 데이터 =========");
        System.out.println(rawResponse.getBody());
        System.out.println("==========================================");


        return restTemplate.postForObject(flaskUrl, requestEntity, FlaskResponseDto.class);


    }
}
