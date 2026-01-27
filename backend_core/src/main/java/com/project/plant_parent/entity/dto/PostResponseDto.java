package com.project.plant_parent.entity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.plant_parent.entity.Member;
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
public class PostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String writer; // Member 전체가 아니라 username만 전달
    private List<CommentResponseDto> comments;


//    private List<PostImageDto> images; // Refactor: editor 개편 (Content에 이미지 정보(Url) 포함 예정)

    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime modifiedAt;


    // Entity -> DTO 변환 생성자
    public static PostResponseDto from(Post post) {
        return PostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .writer(post.getMember().getUsername())
                .comments(
                        post.getComments().stream()
                                .filter(comment -> comment.getParent() == null) // 부모가 없는 원 댓글만 추축
                                .map(CommentResponseDto::from)
                                .collect(Collectors.toList())
                )
//                .images(
//                        post.getPostImages().stream()
//                                .map(PostImageDto::from)
//                                .collect(Collectors.toList())
//                )
                .createdAt(post.getCreatedAt())
                .modifiedAt(post.getModifiedAt())
                .build();
    }

}
