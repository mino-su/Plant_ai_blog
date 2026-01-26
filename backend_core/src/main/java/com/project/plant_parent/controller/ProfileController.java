package com.project.plant_parent.controller;

import com.project.plant_parent.entity.dto.ProfileRequestDto;
import com.project.plant_parent.entity.dto.ProfileResponseDto;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class ProfileController {

    private final ProfileService profileService;


    @GetMapping("/{memberId}/profile")
    public ResponseEntity<ProfileResponseDto> getProfile(
            @PathVariable Long memberId
    ) {
        return ResponseEntity.ok(profileService.getProfile(memberId));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<ProfileResponseDto> updateProfile(
            @RequestPart("profile") ProfileRequestDto profileRequestDto,
            @RequestPart(value="image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetailsImpl userDetails
            ) throws IOException {
        ProfileResponseDto profileResponseDto = profileService.updateProfile(profileRequestDto, image, userDetails.getMember().getId());
        return ResponseEntity.ok(profileResponseDto);
    }
}
