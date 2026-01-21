package com.project.plant_parent.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberIdResponseDto {
    private Long memberId;

    public static MemberIdResponseDto from(Long memberId) {
        return MemberIdResponseDto.builder()
                .memberId(memberId)
                .build();
    }
}
