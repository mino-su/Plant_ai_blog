package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.PostLike;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostLikeDto {
    private Long postId;
    private boolean isLiked;
    private long totalLikeCount;

    public static PostLikeDto of(Long postId, boolean isLiked, long totalLikeCount) {
        return PostLikeDto.builder()
                .postId(postId)
                .isLiked(isLiked)
                .totalLikeCount(totalLikeCount)
                .build();
    }


}
