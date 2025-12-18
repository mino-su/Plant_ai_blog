package com.project.plant_parent.controller;

import com.project.plant_parent.entity.dto.FlaskResponseDto;
import com.project.plant_parent.security.UserDetailsImpl;

import com.project.plant_parent.service.FlaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class FlaskController {

    private final FlaskService flaskService;

    @PostMapping("/detect")
    public ResponseEntity<FlaskResponseDto> detect(MultipartFile image, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long memberId = userDetails.getMember().getId();

        // 파일명 : memberId_UUID_원래이름
        String originalFilename = image.getOriginalFilename();
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String customFileName = memberId.toString() + "_" + UUID.randomUUID() +  extension;

        FlaskResponseDto result = flaskService.analyzeImage(image, customFileName);

        return ResponseEntity.ok(result);

    }
}
