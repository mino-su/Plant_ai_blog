package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.PostImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalysisResponseDto {
    private Long imageId;
    private String plant;
    private String disease;

    private double confidence;
    private String status; // FAILED, SUCCESS


    public static AiAnalysisResponseDto from(PostImage postImage) {
        String status;
        String plantName = postImage.getPlant();

        if ("분석 실패".equals(plantName)) {
            status = "FAILED"; // 분석 시도했으나 에러 발생
        } else {
            status = "SUCCESS"; // 정상 결과 나옴
        }

        return AiAnalysisResponseDto.builder()
                .imageId(postImage.getId())
                .plant(plantName)
                .disease(postImage.getDisease())
                .confidence(postImage.getConfidence())
                .status(status)
                .build();

    }
}
