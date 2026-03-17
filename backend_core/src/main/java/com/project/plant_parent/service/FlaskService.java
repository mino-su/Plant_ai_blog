package com.project.plant_parent.service;

import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.dto.FlaskResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
@RequiredArgsConstructor
public class FlaskService {
    private final RestClient restClient;
    private final StorageService storageService;


    public FlaskResponseDto analyzeImage(String customFilename){


        // 바디 설정: 실제 파일 데이터를 담을 바구니
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        Resource resource = storageService.loadAsResource(customFilename);

        body.add("image", resource);



        try {
            log.info(">>> Flask 서버로 분석 요청중 : {}", customFilename);
            return restClient.post()
                    .uri("/detect")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                        throw new BusinessException(ErrorCode.GLOBAL_INVALID_INPUT);
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (request, response) ->{
                        log.error("[5xx] Flask Server 내부 Error");
                        throw new BusinessException(ErrorCode.AI_SERVER_ERROR);
                    })
                    .body(FlaskResponseDto.class);
        } catch (Exception e) {
            // Flask 와 연결이 끊겼거나 Flask 서버가 down 됐을 경우
            log.error("[5xx] Flask 서버와 연결 불가", e);
            throw new BusinessException(ErrorCode.AI_SERVER_CONNECT_ERROR);
        }


    }
}
