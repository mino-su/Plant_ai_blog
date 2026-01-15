package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.PostImage;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponseDto {
    private Long imageId;
    private String plant;
    private String disease;

    private double confidence;
    private String status; // FAILED, SUCCESS

    public AiAnalysisResponseDto(PostImage postImage) {
        this.imageId = postImage.getId();
        this.plant = postImage.getPlant();
        this.disease = postImage.getDisease();
        this.confidence = postImage.getConfidence();

        // 데이터가 정상적으로 들어있으면 성공으로 표시
        if (postImage.getPlant().equals("분석 대기중...")) {
            this.status = "FAILED";
        } else {
            this.status = "SUCCESS";
        }
    }
}
