package com.project.plant_parent.entity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.plant_parent.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponseDto {
    private Long id;
    private Long parentId;
    private String content;
    @Builder.Default
    private List<CommentResponseDto> children =  new ArrayList<>(); // 보여줄땐 자식들을 리스트로 묶어서
    private String writer;
    private Long memberId;

    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime modifiedAt;

    private boolean isDeleted;

    private String profileImageUrl;


    public static CommentResponseDto from(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .parentId(comment.getParent() != null  ? comment.getParent().getId() : null)
                .content(comment.getContent())
                .writer(comment.getMember() != null ? comment.getMember().getUsername() : "탈퇴한 사용자")
                .memberId(comment.getMember() != null ? comment.getMember().getId() : null)
                .children(
                        comment.getChildren().stream()
                                .map(CommentResponseDto::from)
                                .collect(Collectors.toList())
                )
                .profileImageUrl(comment.getMember().getProfile().getProfileImageUrl())
                .createdAt(comment.getCreatedAt())
                .modifiedAt(comment.getModifiedAt())
                .isDeleted(comment.isDeleted())
                .build();
    }

}
