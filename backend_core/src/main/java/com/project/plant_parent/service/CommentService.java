package com.project.plant_parent.service;

import com.project.plant_parent.entity.Comment;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.dto.CommentRequestDto;
import com.project.plant_parent.entity.dto.CommentResponseDto;
import com.project.plant_parent.repository.CommentRepository;
import com.project.plant_parent.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    // 댓글 작성
    public CommentResponseDto createComment(Long postId, CommentRequestDto commentRequestDto, Member member) {
        // 게시글 확인
        Post post = postRepository.findPostById(postId).orElseThrow(
                () -> new IllegalArgumentException("게시글이 존재하지 않습니다.")
        );

        Comment parent = null;
        // 대댓글인 경우 부모 댓글 확인
        if (commentRequestDto.getParentId() != null) {
            parent = commentRepository.findById(commentRequestDto.getParentId()).orElseThrow(
                    () -> new IllegalArgumentException("부모 댓글이 존재하지 않습니다.")
            );

            // 부모 댓글과 같은 게시글인지 확인
            if (!parent.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("부모 댓글과 같은 게시글에만 대댓글을 달 수 있습니다.");
            }
        }

        Comment comment = Comment.builder()
                .member(member)
                .post(post)
                .content(commentRequestDto.getContent())
                .parent(parent)
                .build();

        commentRepository.save(comment);

        return new CommentResponseDto(comment);
    }

    // 댓글 수정
    public CommentResponseDto update(Long commentId, CommentRequestDto commentRequestDto, Member member) {
        Comment comment = findComment(commentId);

        validateWriter(comment, member);

        comment.update(commentRequestDto.getContent());

        return new CommentResponseDto(comment);
    }

    private Comment findComment(Long commentId) {
        return commentRepository.findById(commentId).orElseThrow(
                () -> new IllegalArgumentException("댓글이 존재하지 않습니다.")
        );
    }

    // 댓글 삭제
    public void delete(Long commentId, Member member) {
        Comment comment = findComment(commentId);
        validateWriter(comment, member);

        // 대댓글이 있는경우 바로 삭제하지 않고 "삭제된 댓글입니다."  처리
        comment.delete();
    }

    public void validateWriter(Comment comment, Member member) {
        if (!comment.getMember().getId().equals(member.getId())) {
            throw new IllegalArgumentException("댓글 작성자만 댓글을 수정/삭제 할 수 있습니다.");
        }
    }



}
