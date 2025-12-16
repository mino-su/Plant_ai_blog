package com.project.plant_parent.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class TokenDto {
    private String grantType; // Bearer
    private String accessToken;
    private String refreshToken; // refreshToken redis로 교체
    private Long accessTokenExpiresIn; // access token 남은 유효시간
}
