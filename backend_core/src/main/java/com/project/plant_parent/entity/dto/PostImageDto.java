package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.PostImage;
import lombok.Getter;

@Getter
public class PostImageDto {
    private Long id;
    private String imageUrl;


    public PostImageDto(PostImage postImage) {
        this.id = postImage.getId();
        this.imageUrl = postImage.getImageUrl();
    }
}
