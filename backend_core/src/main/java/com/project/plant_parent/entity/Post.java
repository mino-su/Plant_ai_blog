package com.project.plant_parent.entity;

import com.project.plant_parent.entity.dto.PostUpdateRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Builder
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Post extends BaseTimeEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 작성자(N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    // 댓글 리스트 (1:N) - 게시글 삭제시 댓글도 삭제(Cascade)
    @Builder.Default
    @BatchSize(size= 100)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    // 이미지 리스트 (1:N) - 게시글 삭제시 이미지도 삭제
    @Builder.Default
    @BatchSize(size = 100)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostImage> postImages = new ArrayList<>();

    // 좋아요 리스트 (1:N) - 게시글 삭제시 좋아요도 삭제
    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100)
    private Set<PostLike> postLikes = new HashSet<>();

    @Builder.Default
    @Column(nullable = false, columnDefinition = "bigint default 0")
    private Long likeCount = 0L; // 좋아요 수 별도 관리

    @Builder
    public Post(String title, String content, Member member) {
        this.title = title;
        this.content = content;
        this.member = member;
    }

    public void update(String title, String content) {
        this.title = title;
        this.content =content;
    }

    public void addLike(){
        this.likeCount++;
    }

    public void removeLike() {
        if (likeCount > 0) {
            this.likeCount--;
        }
    }

}
