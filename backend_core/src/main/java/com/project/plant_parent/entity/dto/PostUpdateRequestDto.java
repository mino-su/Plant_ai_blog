package com.project.plant_parent.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class PostUpdateRequestDto {
    @NotBlank @Size(max=100)
    private String title;
    @NotBlank
    private String content;

    // 삭제할 이미지의 id 리스트 [1,3] -> 1번, 3번 이미지 삭제
    private List<Long> deleteImageIds;

    private List<Long> newImageIds;
}
