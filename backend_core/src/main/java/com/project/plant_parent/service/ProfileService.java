package com.project.plant_parent.service;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Profile;
import com.project.plant_parent.entity.dto.ProfileRequestDto;
import com.project.plant_parent.entity.dto.ProfileResponseDto;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
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
    private final StorageService storageService;
    private final MemberRepository memberRepository;


    public ProfileResponseDto getProfile(Long memberId) {
        Profile profile = getProfileByMemberId(memberId);
        Member member = getMemberByMemberId(memberId);
        return ProfileResponseDto.from(profile,member);

    }

    private Profile getProfileByMemberId(Long memberId) {
        Profile profile = profileRepository.findWithMemberById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        return profile;
    }

    @Transactional
    public ProfileResponseDto updateProfile(ProfileRequestDto profileRequestDto, MultipartFile image, Long memberId) throws IOException {
        Profile profile = getProfileByMemberId(memberId);

        String profileImageUrl = profile.getProfileImageUrl(); // 기존 프로필 이미지 URL

        // 새로운 이미지가 업로드 된 경우
        if (image != null && !image.isEmpty()) {
            if (profileImageUrl != null && !profileImageUrl.contains("default_profile") ) {
                storageService.deleteByUrl(profileImageUrl);
            }
            String newFileName = storageService.saveFile(image);
            profileImageUrl = storageService.getFileUrl(newFileName);
        }

        Member member = getMemberByMemberId(memberId);
        profile.updateProfile(profileRequestDto.getBio(), profileImageUrl, profileRequestDto.getWebsiteUrl());
        member.updateUsername(profileRequestDto.getUsername());
        return ProfileResponseDto.from(profile, member);

    }

    private @NonNull Member getMemberByMemberId(Long memberId) {
        return memberRepository.findById(memberId).orElseThrow(
                () -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND)
        );
    }


}
