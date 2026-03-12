package com.project.plant_parent.entity.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.plant_parent.entity.Follow;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyPageResponseDto {
    private String username;
    private String email;
    private long postCount;
    private long likeCount;
    private long followerCount;
    private long followingCount;

    @JsonProperty("isFollowing")
    private boolean isFollowing;

    @JsonProperty("isFollower")
    private boolean isFollower;

    private List<PostResponseDto> posts;

    private List<PostResponseDto> likePosts;

    public static MyPageResponseDto of(Member member, List<Post> posts, List<Post> likePosts,
                                       long followerCount, long followingCount, boolean isFollowing, boolean isFollower) {
        return MyPageResponseDto.builder()
                .username(member.getUsername())
                .email(member.getEmail())
                .postCount(posts.size())
                .likeCount(likePosts.size())
                .followerCount(followerCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .isFollower(isFollower)
                .posts(posts.stream().map(
                        PostResponseDto::from
                        ).collect(Collectors.toList()))
                .likePosts(likePosts.stream().map(
                                PostResponseDto::from
                        ).collect(Collectors.toList()))
                .build();
    }
}
