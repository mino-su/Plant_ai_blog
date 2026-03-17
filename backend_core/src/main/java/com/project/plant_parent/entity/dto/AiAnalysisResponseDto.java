package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.DiseaseDictionary;
import com.project.plant_parent.entity.PlantDictionary;
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
    private String status; // FAILED, SUCCESS

    private String resultImgUrl;

    // PlantDecionary 정보
    private String plantLabel;
    private String plantNameKr;
    private String plantDescription;

    // DiseaseDictionary 정보
    private String diseaseLabel;
    private String diseaseNameKr;
    private Double diseaseConfidence;

    // Guide 정보
    private String symptoms;
    private String solutions;
    private String prevention;
    private String dangerLevel;


    public static AiAnalysisResponseDto of(PostImage postImage,
                                           PlantDictionary plantDictionary,
                                           DiseaseDictionary diseaseDictionary,
                                           FlaskResponseDto flaskResponseDto) {

        return AiAnalysisResponseDto.builder()
                .imageId(postImage.getId())
                .status("SUCCESS")
                .plantLabel(plantDictionary.getLabel())
                .plantNameKr(plantDictionary.getNameKr())
                .plantDescription(plantDictionary.getDescription())
                .diseaseLabel(diseaseDictionary.getLabel())
                .diseaseNameKr(diseaseDictionary.getNameKr())
                .diseaseConfidence(postImage.getConfidence())
                .resultImgUrl(flaskResponseDto.getPlant_result_image())
                .symptoms(diseaseDictionary.getGuide().getSymptoms())
                .solutions(diseaseDictionary.getGuide().getSolutions())
                .prevention(diseaseDictionary.getGuide().getPrevention())
                .dangerLevel(diseaseDictionary.getGuide().getDangerLevel().name())
                .build();

    }
}
