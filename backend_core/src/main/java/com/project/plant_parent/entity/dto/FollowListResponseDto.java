package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Follow;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Profile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowListResponseDto {
    private Long memberId;
    private String username;
    private String profileImageUrl;
    private boolean isFollowing;

    public static FollowListResponseDto of(Member member, Profile profile, boolean isFollowing) {
        return FollowListResponseDto.builder()
                .memberId(member.getId())
                .username(member.getUsername())
                .profileImageUrl(profile.getProfileImageUrl())
                .isFollowing(isFollowing)
                .build();
    }
}
