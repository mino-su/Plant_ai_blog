package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Profile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileRequestDto {

    @NotBlank @Size(max=30)
    private String username;

    private String bio;

    private String websiteUrl;

    public static ProfileRequestDto of(String username,String bio, String websiteUrl) {
        return ProfileRequestDto.builder()
                .username(username)
                .bio(bio)
                .websiteUrl(websiteUrl)
                .build();
    }
}
