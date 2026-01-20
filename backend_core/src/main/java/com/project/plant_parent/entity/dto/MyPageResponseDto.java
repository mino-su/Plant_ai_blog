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
    private int postCount;
    private int followerCount;
    private int followingCount;

    private List<PostResponseDto> posts;

    public static MyPageResponseDto of(Member member, List<Post> posts, int followerCount, int followingCount) {
        return MyPageResponseDto.builder()
                .username(member.getUsername())
                .email(member.getEmail())
                .postCount(posts.size())
                .followerCount(followerCount)
                .followingCount(followingCount)
                .posts(posts.stream().map(PostResponseDto::from).collect(Collectors.toList()))
                .build();
    }
}
