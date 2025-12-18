package com.project.plant_parent.entity.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class FlaskResponseDto {
    private String status; // Flask의 statis
    private String filename; //flask의 filename: email_uuid
    private DetectionResults results; // flask custom model detection result

    @Getter
    @NoArgsConstructor
    public static class DetectionResults{
        private List<DetectionInfo> plant_detection;
        private List<DetectionInfo> disease_analysis;
    }

    @Getter
    @NoArgsConstructor
    public static class DetectionInfo{
        private String label; // 결과 라벨 이름
        private Double confidence; // 확신도 수치
    }
}
