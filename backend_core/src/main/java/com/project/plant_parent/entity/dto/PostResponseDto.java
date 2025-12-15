package com.project.plant_parent.entity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class PostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String writer; // Member 전체가 아니라 username만 전달
    private List<CommentResponseDto> comments;

    // [핵심 1] 이미지 리스트 (Entity가 아닌 DTO 리스트)
    private List<PostImageDto> images;

    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime modifiedAt;


    // Entity -> DTO 변환 생성자
    public PostResponseDto(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.writer = post.getMember().getUsername();

        // [수정 후] 부모가 없는(null) '최상위 댓글'만 필터링해서 리스트에 담음
        this.comments = post.getComments().stream()
                .filter(comment -> comment.getParent() == null) // ★ 핵심: 부모 없는 애들만!
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());

        // [변환 로직 1] PostImage Entity List -> ImageDto List
        this.images = post.getPostImages().stream()
                .map(PostImageDto::new)
                .collect(Collectors.toList());

        this.createdAt = post.getCreatedAt();
        this.modifiedAt = post.getModifiedAt();

    }

}
