package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor // json parsing을 위해 기본 생성자 추가
@Getter
@AllArgsConstructor
public class PostRequestDto {
    @NotBlank @Size(max=100)
    private String title;
    @NotBlank
    private String content;
    // Member는 SecurityContext에서 가져올 것이므로 DTO에 포함하지 않음
    private List<Long> imageIds;

    @NotNull
    private Category category;
}
