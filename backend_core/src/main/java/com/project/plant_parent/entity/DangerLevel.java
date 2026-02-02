package com.project.plant_parent.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DangerLevel {


    LOW("낮음","단순 정보 제공"),
    MEDIUM("보통", "주의 관찰 필요"),
    HIGH("높음", "즉시 격리 및 강력 방제 필요") ;

    private final String title;
    private final String description;


}
