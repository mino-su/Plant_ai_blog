package com.project.plant_parent.service;

import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.entity.Comment;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.dto.CommentRequestDto;
import com.project.plant_parent.entity.dto.CommentResponseDto;
import com.project.plant_parent.repository.CommentRepository;
import com.project.plant_parent.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
@Transactional
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;

    // 댓글 작성
    public CommentResponseDto createComment(Long postId, CommentRequestDto commentRequestDto, Member member) {
        // 게시글 확인
        Post post = postRepository.findPostById(postId).orElseThrow(
                () -> new BusinessException(ErrorCode.POST_NOT_FOUND)
        );

        Comment parent = null;
        // 대댓글인 경우 부모 댓글 확인
        if (commentRequestDto.getParentId() != null) {
            parent = commentRepository.findById(commentRequestDto.getParentId()).orElseThrow(
                    () -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND)
            );

            // 부모 댓글과 같은 게시글인지 확인
            if (!parent.getPost().getId().equals(postId)) {
                throw new BusinessException(ErrorCode.COMMENT_NOT_MATCHED);
            }
        }

        Comment comment = Comment.builder()
                .member(member)
                .post(post)
                .content(commentRequestDto.getContent())
                .parent(parent)
                .build();

        commentRepository.save(comment);

        Long receiverId = post.getMember().getId();

        if (!receiverId.equals(member.getId())) {
            String message = member.getUsername() + "님이 회원님의 게시글에 댓글을 남겼습니다.";
            notificationService.notify(receiverId, message, "comment");
        }

        return CommentResponseDto.from(comment);
    }

    // 댓글 수정
    public CommentResponseDto update(Long commentId, CommentRequestDto commentRequestDto, Member member) {
        Comment comment = findComment(commentId);

        validateWriter(comment, member);

        comment.update(commentRequestDto.getContent());

        return CommentResponseDto.from(comment);
    }

    private Comment findComment(Long commentId) {
        return commentRepository.findById(commentId).orElseThrow(
                () -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND)
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
            throw new BusinessException(ErrorCode.COMMENT_NOT_WRITER);
        }
    }



}
