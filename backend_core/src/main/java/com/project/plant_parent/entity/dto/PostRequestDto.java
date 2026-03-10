package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor // json parsing을 위해 기본 생성자 추가
@Getter
@AllArgsConstructor
public class PostRequestDto {
    @NotBlank @Size(max=30)
    private String title;
    @NotBlank @Size(max=500)
    private String content;
    // Member는 SecurityContext에서 가져올 것이므로 DTO에 포함하지 않음
    private List<Long> imageIds;
}
