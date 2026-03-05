package com.project.plant_parent.service;

import com.project.plant_parent.entity.Authority;
import com.project.plant_parent.entity.Comment;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.Profile;
import com.project.plant_parent.entity.dto.CommentRequestDto;
import com.project.plant_parent.entity.dto.CommentResponseDto;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.repository.CommentRepository;
import com.project.plant_parent.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;

/**
 * CommentService 단위 테스트
 * - 댓글 생성, 수정, 삭제의 핵심 예외 흐름을 검증
 */
@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommentService commentService;

    private Member postOwner;
    private Member commenter;
    private Member stranger;
    private Post post;
    private Comment parentComment;

    @BeforeEach
    void setUp() {
        postOwner = Member.builder()
                .email("owner@test.com")
                .password("pw")
                .username("게시글작성자")
                .authority(Authority.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(postOwner, "id", 1L);

        commenter = Member.builder()
                .email("commenter@test.com")
                .password("pw")
                .username("댓글작성자")
                .authority(Authority.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(commenter, "id", 2L);
        // CommentResponseDto.from()에서 profile.getProfileImageUrl() 호출 대비
        Profile commenterProfile = Profile.builder()
                .member(commenter)
                .bio("바이오")
                .profileImageUrl("/images/default.jpg")
                .build();
        commenter.setProfile(commenterProfile);

        stranger = Member.builder()
                .email("stranger@test.com")
                .password("pw")
                .username("다른사람")
                .authority(Authority.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(stranger, "id", 3L);

        post = Post.builder()
                .title("게시글")
                .content("내용")
                .member(postOwner)
                .build();
        ReflectionTestUtils.setField(post, "id", 10L);

        parentComment = Comment.builder()
                .content("부모 댓글")
                .member(commenter)
                .post(post)
                .parent(null)
                .build();
        ReflectionTestUtils.setField(parentComment, "id", 100L);
    }

    // --- createComment ---

    @Test
    @DisplayName("존재하지 않는 게시글에 댓글 작성 시 POST_NOT_FOUND 예외가 발생한다")
    void createComment_whenPostNotFound_throwsPostNotFound() {
        // given
        given(postRepository.findPostById(anyLong())).willReturn(Optional.empty());
        CommentRequestDto requestDto = new CommentRequestDto("댓글 내용", null);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> commentService.createComment(999L, requestDto, commenter));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.POST_NOT_FOUND);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("POST_001");
    }

    @Test
    @DisplayName("부모 댓글이 다른 게시글에 속한 경우 COMMENT_NOT_MATCHED 예외가 발생한다")
    void createComment_whenParentNotMatched_throwsCommentNotMatched() {
        // given : 부모 댓글이 다른 게시글(id=999)에 속한 상황
        Post anotherPost = Post.builder()
                .title("다른 게시글")
                .content("내용")
                .member(postOwner)
                .build();
        ReflectionTestUtils.setField(anotherPost, "id", 999L);

        Comment wrongParent = Comment.builder()
                .content("다른 게시글의 댓글")
                .member(commenter)
                .post(anotherPost)
                .parent(null)
                .build();
        ReflectionTestUtils.setField(wrongParent, "id", 200L);

        given(postRepository.findPostById(10L)).willReturn(Optional.of(post));
        given(commentRepository.findById(200L)).willReturn(Optional.of(wrongParent));

        CommentRequestDto requestDto = new CommentRequestDto("대댓글", 200L);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> commentService.createComment(10L, requestDto, commenter));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.COMMENT_NOT_MATCHED);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("COMMENT_003");
    }

    @Test
    @DisplayName("정상적인 댓글 작성 시 CommentResponseDto가 반환된다")
    void createComment_success() {
        // given
        given(postRepository.findPostById(10L)).willReturn(Optional.of(post));
        given(commentRepository.save(any(Comment.class))).willAnswer(invocation -> invocation.getArgument(0));

        CommentRequestDto requestDto = new CommentRequestDto("정상 댓글", null);

        // when
        CommentResponseDto result = commentService.createComment(10L, requestDto, commenter);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("정상 댓글");
        assertThat(result.getWriter()).isEqualTo("댓글작성자");
    }

    // --- update ---

    @Test
    @DisplayName("댓글 수정 시 작성자가 아니면 COMMENT_NOT_WRITER 예외가 발생한다")
    void update_whenNotWriter_throwsCommentNotWriter() {
        // given : commenter가 작성한 댓글을 stranger가 수정 시도
        given(commentRepository.findById(100L)).willReturn(Optional.of(parentComment));
        CommentRequestDto requestDto = new CommentRequestDto("수정 내용", null);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> commentService.update(100L, requestDto, stranger));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.COMMENT_NOT_WRITER);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("COMMENT_002");
    }

    // --- delete ---

    @Test
    @DisplayName("댓글 삭제 시 작성자가 아니면 COMMENT_NOT_WRITER 예외가 발생한다")
    void delete_whenNotWriter_throwsCommentNotWriter() {
        // given : commenter가 작성한 댓글을 stranger가 삭제 시도
        given(commentRepository.findById(100L)).willReturn(Optional.of(parentComment));

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> commentService.delete(100L, stranger));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.COMMENT_NOT_WRITER);
    }
}
