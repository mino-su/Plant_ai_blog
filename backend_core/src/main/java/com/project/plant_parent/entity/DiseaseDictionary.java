package com.project.plant_parent.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "disease_dictionary", uniqueConstraints={
        @UniqueConstraint(name="unique_label", columnNames = {"label"})
})
public class DiseaseDictionary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;  // AI 모델이 반환하는 영문 라벨 ex: "Curing"

    @Column(nullable = false)
    private String nameKr; // 사용자에게 보여울 한국명 ex: "잎 말림"

    @Embedded
    private Guide guide;

    // 도감 정보 수정 메서드
    public void update(String nameKr, Guide guide) {
        this.nameKr = nameKr;
        this.guide = guide;
    }

    /**
     * {
     *   "label": "Curing",
     *   "nameKr": " 잎 말림",
     *   "confidence": 0.92,
     *   "guide": {
     *     "symptoms": "잎 가장자리가 갈색으로 타들어 가며...",
     *     "solutions": "감염된 잎을 즉시 제거하고...",
     *     "dangerLevel": "높음"
     *   }
     * }
     */
}
