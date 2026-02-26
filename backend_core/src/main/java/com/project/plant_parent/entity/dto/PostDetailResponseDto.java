package com.project.plant_parent.entity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.plant_parent.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDetailResponseDto {
    private Long id;
    private String title;
    private String content;
    private String writer; // Member 전체가 아니라 username만 전달
    private Long memberId;
    private List<CommentResponseDto> comments;
    private PostLikeDto postLike;


    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime modifiedAt;


    // Entity -> DTO 변환 생성자
    public static PostDetailResponseDto of(Post post, PostLikeDto postLike) {
        return PostDetailResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .memberId(post.getMember().getId())
                .writer(post.getMember().getUsername())
                .comments(
                        post.getComments().stream()
                                .filter(comment -> comment.getParent() == null) // 부모가 없는 원 댓글만 추축
                                .map(CommentResponseDto::from)
                                .collect(Collectors.toList())
                )
                .postLike(postLike)
                .createdAt(post.getCreatedAt())
                .modifiedAt(post.getModifiedAt())
                .build();
    }
}
