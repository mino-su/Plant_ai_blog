package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor // json parsing을 위해 기본 생성자 추가
@Getter
public class PostRequestDto {
    private String title;
    private String content;
    // Member는 SecurityContext에서 가져올 것이므로 DTO에 포함하지 않음
}
