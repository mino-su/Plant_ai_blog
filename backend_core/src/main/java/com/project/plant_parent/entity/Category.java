package com.project.plant_parent.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Category {

    QUESTION("Q&A", "식물에 대한 질문과 답변을 나누는 공간입니다."),
    COMMUNITY("커뮤니티", "식물 애호가들이 자유롭게 소통하고 경험을 나누는 공간입니다.");

    private final String name;
    private final String description;
}
