package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Follow;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyPageResponseDto {
    private String username;
    private String email;
    private long postCount;
    private long followerCount;
    private long followingCount;
    private boolean isFollowing;
    private boolean isFollower;

    private List<PostResponseDto> posts;

    public static MyPageResponseDto of(Member member, List<Post> posts,
                                       long followerCount, long followingCount, boolean isFollowing, boolean isFollower) {
        return MyPageResponseDto.builder()
                .username(member.getUsername())
                .email(member.getEmail())
                .postCount(posts.size())
                .followerCount(followerCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .isFollower(isFollower)
                .posts(posts.stream().map(PostResponseDto::from).collect(Collectors.toList()))
                .build();
    }
}
