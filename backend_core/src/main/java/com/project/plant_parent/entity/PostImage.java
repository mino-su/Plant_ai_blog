package com.project.plant_parent.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Getter
// 이미지 실제 파일은 서버에 저장하고 DB에는 경로만 저장
public class PostImage extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl; // 이미지 경로
    private String originalFileName; // 원본 파일명

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="post_id")
    private Post post;

    @Builder
    public PostImage(String imageUrl, String originalFileName, Post post) {
        this.imageUrl = imageUrl;
        this.originalFileName = originalFileName;
        this.post = post;
    }
}
