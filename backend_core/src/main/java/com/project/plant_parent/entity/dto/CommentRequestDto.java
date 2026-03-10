package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Comment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CommentRequestDto {
    @NotBlank @Size(max=500)
    private String content;

    private Long parentId; // 대댓글이 아니고 새 댓글이면 null


    @Builder
    public CommentRequestDto(String content, Long parentId) {
        this.content = content;
        this.parentId = parentId;
    }

    public CommentRequestDto(String content) {
        this.content = content;
        this.parentId = null;
    }
}
