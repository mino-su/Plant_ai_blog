package com.project.plant_parent.controller;

import com.project.plant_parent.entity.dto.CommentRequestDto;
import com.project.plant_parent.entity.dto.CommentResponseDto;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CommentController {
    private final CommentService commentService;

    // 댓글 생성
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable("postId") Long postId,
            @RequestBody CommentRequestDto commentRequestDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return ResponseEntity.ok(commentService.createComment(postId, commentRequestDto, userDetails.getMember()));
    }
    // 댓글 조회는 게시글을 조회할때 댓글 리스트도 같이 포장해서 나감


    // 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        commentService.delete(commentId, userDetails.getMember());
        return ResponseEntity.ok("댓글 삭제 완료");
    }

    // 댓글 수정
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequestDto commentRequestDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        return ResponseEntity.ok(commentService.update(commentId, commentRequestDto, userDetails.getMember()));
    }
}
