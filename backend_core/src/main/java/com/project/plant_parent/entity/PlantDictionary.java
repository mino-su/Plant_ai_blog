package com.project.plant_parent.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "plant_dictionary",
        uniqueConstraints = {
            @UniqueConstraint(name = "unique_plant_label", columnNames = {"label"})
})
public class PlantDictionary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;  // AI 모델이 반환하는 영문 라벨 ex: "FicusLyrata"

    @Column(nullable = false)
    private String nameKr; // 사용자에게 보여울 한국명 ex: "피카스 리라타"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description; // 식물 설명

    public void update(String nameKr, String description) {
        this.nameKr = nameKr;
        this.description = description;
    }
}
