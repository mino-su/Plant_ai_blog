package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Profile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileResponseDto {
    private String username;

    private String bio;

    private String profileImageUrl;

    private String websiteUrl;

    public static ProfileResponseDto from(Profile profile, Member member) {
        return ProfileResponseDto.builder()
                .username(member.getUsername())
                .bio(profile.getBio())
                .profileImageUrl(profile.getProfileImageUrl())
                .websiteUrl(profile.getWebsiteUrl())
                .build();
    }
}
