package com.project.plant_parent.service;

import com.project.plant_parent.entity.DangerLevel;
import com.project.plant_parent.entity.DiseaseDictionary;
import com.project.plant_parent.entity.Guide;
import com.project.plant_parent.entity.PlantDictionary;
import com.project.plant_parent.entity.dto.AiAnalysisResponseDto;
import com.project.plant_parent.entity.dto.FlaskResponseDto;
import com.project.plant_parent.repository.DiseaseDictionaryRepository;
import com.project.plant_parent.repository.PlantDictionaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAnalysisService {

    private final FlaskService flaskService;
    private final PlantDictionaryRepository plantDictionaryRepository;
    private final DiseaseDictionaryRepository diseaseDictionaryRepository;

    /**
     *  FlaskService를 통해서 ai 분석 label을 받아온 다음
     *  받아온 라벨을 이용해서 DB(도감 테이블)에서 상세 정보 조회
     *  분석 결과와 도감 정보를 합쳐서 최종 응답 DTO 생성후 반환
     **/
    public AiAnalysisResponseDto getFullAnalysis(MultipartFile image, String customFileName) {
        FlaskResponseDto flaskResult = flaskService.analyzeImage(image, customFileName);

        if (flaskResult == null || flaskResult.getResults() == null) {
            log.error(">>> AI 분석 결과가 유효하지 않습니다.");
            return AiAnalysisResponseDto.builder().status("FAILED").build();
        }


        String pLabel;

        if (flaskResult.getResults().getPlant_detection() != null &&
                !flaskResult.getResults().getPlant_detection().isEmpty()) {
            pLabel = flaskResult.getResults().getPlant_detection().get(0).getLabel();
        } else {
            pLabel = "Unknown";
        }

        String dLabel;
        Double dConfidence = 0.0;
        if (flaskResult.getResults().getDisease_analysis() != null &&
                !flaskResult.getResults().getDisease_analysis().isEmpty()) {
            dLabel = flaskResult.getResults().getDisease_analysis().get(0).getLabel();
            dConfidence = flaskResult.getResults().getDisease_analysis().get(0).getConfidence();
        } else {
            dLabel = "normal";
        }

        // plant dictionary 조회
        PlantDictionary plantDictionary = plantDictionaryRepository.findByLabel(pLabel).orElseGet(
                () -> PlantDictionary.builder()
                        .label(pLabel)
                        .nameKr("알 수 없는 식물")
                        .description("해당 식물에 대한 정보가 없습니다.")
                        .build()
        );

        // disease dictionary 조회
        DiseaseDictionary diseaseDictionary = diseaseDictionaryRepository.findByLabel(dLabel).orElseGet(
                () -> DiseaseDictionary.builder()
                        .label(dLabel)
                        .nameKr("진단 정보 알수 없음")
                        .guide(
                                Guide.builder()
                                        .symptoms("정보가 없습니다.")
                                        .solutions("가까운 화원이나 전문가에게 문의하세요.")
                                        .dangerLevel(DangerLevel.LOW)
                                        .build()
                        )
                        .build()
        );

        return AiAnalysisResponseDto.builder()
                .status("SUCCESS")
                .plantLabel(plantDictionary.getLabel())
                .plantNameKr(plantDictionary.getNameKr())
                .plantDescription(plantDictionary.getDescription())
                .diseaseConfidence(dConfidence)
                .diseaseLabel(diseaseDictionary.getLabel())
                .diseaseNameKr(diseaseDictionary.getNameKr())
                .symptoms(diseaseDictionary.getGuide().getSymptoms())
                .solutions(diseaseDictionary.getGuide().getSolutions())
                .prevention(diseaseDictionary.getGuide().getPrevention())
                .dangerLevel(diseaseDictionary.getGuide().getDangerLevel().name())
                .build();
    }



}
