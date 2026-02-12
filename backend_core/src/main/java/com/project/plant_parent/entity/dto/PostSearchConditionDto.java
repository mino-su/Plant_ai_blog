package com.project.plant_parent.entity.dto;

import lombok.Data;

@Data
public class PostSearchConditionDto {
    private String type; // 검색 필드 선택(전체, 제목, 내용, 식물명 등)
    private String keyword; // 검색어
}
