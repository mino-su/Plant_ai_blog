package com.project.plant_parent.service;

import com.project.plant_parent.entity.*;
import com.project.plant_parent.entity.dto.AiAnalysisResponseDto;
import com.project.plant_parent.entity.dto.FlaskResponseDto;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.repository.DiseaseDictionaryRepository;
import com.project.plant_parent.repository.PlantDictionaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.net.URI;

@Service
@Slf4j
@Profile("prod")
@RequiredArgsConstructor
public class S3AiAnalysisService implements AiAnalysisService{

    private final FlaskService flaskService;
    private final PlantDictionaryRepository plantDictionaryRepository;
    private final DiseaseDictionaryRepository diseaseDictionaryRepository;

    @Value("${aws.s3.bucket-name:plant-parent-image-bucket}")
    private String bucketName;

    @Value("${aws.s3.region:ap-northeast-2}")
    private String region;

    private static final String S3_PREFIX = "uploads/";

    public AiAnalysisResponseDto getFullAnalysis(PostImage postImage) {


        String fileName = extractFileName(postImage.getImageUrl());

        FlaskResponseDto flaskResult = flaskService.analyzeImage(fileName);


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
            dLabel = "Unknown";
        }

        // DB에 postImage 정보 update
        postImage.updateAiResult(pLabel,dLabel,dConfidence);

        // plant dictionary 조회
        PlantDictionary plantDictionary = plantDictionaryRepository.findByLabel(pLabel).orElseGet(
                () -> PlantDictionary.builder()
                        .label(pLabel)
                        .nameKr("알 수 없는 식물")
                        .description("해당 식물에 대한 정보가 없습니다.")
                        .build()
        );

        String imageUrl = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + S3_PREFIX;

        // disease dictionary 조회

        if(dLabel.equals("healthy")){
            return AiAnalysisResponseDto.builder()
                    .imageId(postImage.getId())
                    .status("SUCCESS")
                    .plantLabel(plantDictionary.getLabel())
                    .plantNameKr(plantDictionary.getNameKr())
                    .plantDescription(plantDictionary.getDescription())
                    .diseaseConfidence(dConfidence)
                    .resultImgUrl(imageUrl + flaskResult.getPlant_result_image())
                    .diseaseLabel("Healthy")
                    .diseaseNameKr("건강한 식물")
                    .symptoms("식물이 건강합니다.")
                    .solutions("특별한 관리가 필요하지 않습니다.")
                    .prevention("정기적인 관리를 통해 건강을 유지하세요.")
                    .dangerLevel(DangerLevel.LOW.name())
                    .build();
        }
        else {
            DiseaseDictionary diseaseDictionary = diseaseDictionaryRepository.findByLabel(dLabel).orElseGet(
                    () -> DiseaseDictionary.builder()
                            .label(dLabel)
                            .nameKr("진단 정보 알수 없음")
                            .guide(
                                    Guide.builder()
                                            .symptoms("정보가 없습니다.")
                                            .solutions("가까운 화원이나 전문가에게 문의하세요.")
                                            .prevention("예방 정보가 없습니다.")
                                            .dangerLevel(DangerLevel.LOW)
                                            .build()
                            )
                            .build()
            );


            return AiAnalysisResponseDto.builder()
                    .imageId(postImage.getId())
                    .status("SUCCESS")
                    .plantLabel(plantDictionary.getLabel())
                    .plantNameKr(plantDictionary.getNameKr())
                    .plantDescription(plantDictionary.getDescription())
                    .diseaseConfidence(dConfidence)
                    .diseaseLabel(diseaseDictionary.getLabel())
                    .diseaseNameKr(diseaseDictionary.getNameKr())
                    .resultImgUrl(imageUrl + flaskResult.getPlant_result_image())
                    .symptoms(diseaseDictionary.getGuide().getSymptoms())
                    .solutions(diseaseDictionary.getGuide().getSolutions())
                    .prevention(diseaseDictionary.getGuide().getPrevention())
                    .dangerLevel(diseaseDictionary.getGuide().getDangerLevel().name())
                    .build();

        }
    }

    private String extractFileName(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new BusinessException(ErrorCode.GLOBAL_INVALID_INPUT);
        }
        try {
            if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                // S3 URL: https://bucket.s3.region.amazonaws.com/uploads/uuid_name.jpg
                String path = URI.create(imageUrl).getPath(); // → /uploads/uuid_name.jpg
                int lastSlash = path.lastIndexOf('/');
                return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
            }
            return imageUrl;
        } catch (Exception e) {
            log.error(">>> imageUrl에서 파일명 추출 실패: {}", imageUrl, e);
            throw new BusinessException(ErrorCode.GLOBAL_INVALID_INPUT);
        }
    }



}
