package com.project.plant_parent.entity.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
// 재발급용
public class TokenRequestDto {
    private String accessToken;
    private String refreshToken;
}
