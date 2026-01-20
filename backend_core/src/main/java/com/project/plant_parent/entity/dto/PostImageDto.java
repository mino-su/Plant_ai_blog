package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.PostImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostImageDto {
    private Long id;
    private String imageUrl;

    // Entity -> DTO 변환 생성자
    public static PostImageDto from(PostImage postImage) {
        return PostImageDto.builder()
                .id(postImage.getId())
                .imageUrl(postImage.getImageUrl())
                .build();
    }
}
