package com.project.plant_parent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Table(name = "post_images")
// 이미지 실제 파일은 서버에 저장하고 DB에는 경로만 저장
public class PostImage extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl; // 이미지 경로
    private String originalFileName; // 원본 파일명

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="post_id", nullable = true)
    private Post post;

    @Builder
    public PostImage(String imageUrl, String originalFileName, Post post, String plant, String disease, double confidence){
        this.imageUrl = imageUrl;
        this.originalFileName = originalFileName;
        this.post = post;
        this.plant = plant;
        this.disease = disease;
        this.confidence = confidence;

    }

    // ai-flask에서 받아온 결과 PostImage 업데이트
    @Column
    private String plant = "분석 중...";

    @Column
    private String disease = "분석 중...";

    @Column
    private double confidence = 0.0;

    // 나중에 게시글이 생성되었을때 이 이미지들을 해당 게시글과 연결
    public void mappingPost(Post post) {
        this.post = post;
        if (!post.getPostImages().contains(this)) {
            post.getPostImages().add(this);
        }
    }

    // ai 분석 결과 업데이트 메서드
    public void updateAiResult(String plant, String disease, double confidence){
        this.plant = plant;
        this.disease = disease;
        this.confidence = confidence;
    }


}
