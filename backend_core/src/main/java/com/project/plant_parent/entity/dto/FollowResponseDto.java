package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Follow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowResponseDto {

    private MemberResponseDto toMember;

    private MemberResponseDto fromMember;

    private LocalDateTime createdAt;

    // Entity -> Dto 변환
    public static FollowResponseDto from(Follow follow) {
        return FollowResponseDto.builder()
                .toMember(MemberResponseDto.from(follow.getToMember()))
                .fromMember(MemberResponseDto.from(follow.getFromMember()))
                .createdAt(follow.getCreatedAt())
                .build();
    }
}
