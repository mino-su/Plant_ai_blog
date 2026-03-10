package com.project.plant_parent.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
// 재발급용
public class TokenRequestDto {
    @NotBlank
    private String accessToken;
    @NotBlank
    private String refreshToken;
}
