package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Profile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileRequestDto {
    private String bio;

    private String websiteUrl;

    public static ProfileRequestDto of(String bio, String websiteUrl) {
        return ProfileRequestDto.builder()
                .bio(bio)
                .websiteUrl(websiteUrl)
                .build();
    }
}
