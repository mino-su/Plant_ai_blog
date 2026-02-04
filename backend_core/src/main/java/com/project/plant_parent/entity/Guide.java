package com.project.plant_parent.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Embeddable
public class Guide {
    @Column(columnDefinition = "TEXT")
    private String symptoms; // 증상

    @Column(columnDefinition = "TEXT")
    private String solutions; // 해결방식

    @Column(columnDefinition = "TEXT")
    private String prevention; // 예방

    @Enumerated(EnumType.STRING)
    private DangerLevel dangerLevel; // 위험도
}
