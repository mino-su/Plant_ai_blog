package com.project.plant_parent.controller;

import com.project.plant_parent.entity.dto.PlantApiResponseDto;
import com.project.plant_parent.entity.dto.PlantDetailResponseDto;
import com.project.plant_parent.service.PublicDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/publicData")
@RequiredArgsConstructor
public class PublicDataController {
    private final PublicDataService publicDataService;

    @GetMapping
    public ResponseEntity<PlantApiResponseDto> getPublicData(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "12") int numOfRows,
            @RequestParam(required = false) String sType,
            @RequestParam(required = false) String sText,
            @RequestParam(required = false) String wordType,
            @RequestParam(required = false) String word,
            @RequestParam(required = false) String lightChkVal,
            @RequestParam(required = false) String grwhstleChkVal,
            @RequestParam(required = false) String lefcolrChkVal,
            @RequestParam(required = false) String ignSeasonChkVal

    ) {
        PlantApiResponseDto response = publicDataService.fetchPlantData(
                pageNo, numOfRows, sType, sText, wordType, word, lightChkVal, grwhstleChkVal,
                lefcolrChkVal, ignSeasonChkVal
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{cntntsNo}")
    public ResponseEntity<PlantDetailResponseDto> getPlantDetailData(
            @PathVariable int cntntsNo) {
        PlantDetailResponseDto response = publicDataService.getPlantDetail(cntntsNo);
        return ResponseEntity.ok(response);
    }

}
