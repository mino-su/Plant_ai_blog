package com.project.plant_parent.service;

import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.dto.PlantApiResponseDto;
import com.project.plant_parent.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicDataService {
    private final RestClient publicDataClient;
    @Value("${nongsaro.key}")
    private String apiKey;


    public PlantApiResponseDto fetchPlantData(
            int pageNo, int numOfRows,String sType, String sText, String wordType, String word,
            String lightChkVal, String grwhstleChkVal, String lefcolrChkVal,
            String ignSeasonChkVal
    ) {


        UriComponentsBuilder builder = UriComponentsBuilder.fromPath("/gardenList")
                .queryParam("apiKey", apiKey)
                .queryParam("pageNo", pageNo)
                .queryParam("numOfRows", numOfRows);

        if(sType != null && !sType.isBlank()) builder.queryParam("sType", sType);
        if(sText != null && !sText.isBlank()) builder.queryParam("sText", sText);
        if(wordType != null && !wordType.isBlank()) builder.queryParam("wordType", wordType);
        if(word != null && !word.isBlank()) builder.queryParam("word", word);
        if(lightChkVal != null && !lightChkVal.isBlank()) builder.queryParam("lightChkVal", lightChkVal);
        if(grwhstleChkVal != null && !grwhstleChkVal.isBlank()) builder.queryParam("grwhstleChkVal", grwhstleChkVal);
        if(ignSeasonChkVal != null && !ignSeasonChkVal.isBlank()) builder.queryParam("ignSeasonChkVal", ignSeasonChkVal);

        String uriPath = builder.build().toUriString();

        try {
            return publicDataClient.get()
                    .uri(uriPath)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, ((request, response) -> {
                        throw new BusinessException(ErrorCode.GLOBAL_INVALID_INPUT);
                    }))
                    .body(PlantApiResponseDto.class);

        }catch (Exception e){
            log.error("공공데이터 서버와 연결 불가", e);
            throw new BusinessException(ErrorCode.PUBLIC_DATA_CONNECT_ERROR);
        }
    }
}
