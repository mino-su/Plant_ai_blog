package com.project.plant_parent.service;

import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Profile;
import com.project.plant_parent.entity.dto.ProfileRequestDto;
import com.project.plant_parent.entity.dto.ProfileResponseDto;
import com.project.plant_parent.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final FileService fileService;


    public ProfileResponseDto getProfile(Long memberId) {
        Profile profile = getProfileByMemberId(memberId);
        return ProfileResponseDto.from(profile);

    }

    private Profile getProfileByMemberId(Long memberId) {
        Profile profile = profileRepository.findProfileById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        return profile;
    }

    @Transactional
    public ProfileResponseDto updateProfile(ProfileRequestDto profileRequestDto, MultipartFile image, Long memberId) throws IOException {
        Profile profile = getProfileByMemberId(memberId);

        String profileImageUrl = profile.getProfileImageUrl(); // 기존 프로필 이미지 URL

        // 새로운 이미지가 업로드 된 경우
        if (image != null && !image.isEmpty()) {
            if (profileImageUrl != null && profileImageUrl.startsWith("/images/")) {
                String oldFileName = profileImageUrl.replace("/images/", "");
                fileService.deleteFile(oldFileName);
                // 기존 파일 삭제
            }
            String newFileName = fileService.saveFile(image);
            profileImageUrl = "/images/" + newFileName;
        }

        profile.updateProfile(profileRequestDto.getBio(), profileImageUrl, profileRequestDto.getWebsiteUrl());
        return ProfileResponseDto.from(profile);

    }


}
