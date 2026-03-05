package com.project.plant_parent.service;

import com.project.plant_parent.entity.Authority;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.repository.PostImageRepository;
import com.project.plant_parent.repository.PostLikeRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;

/**
 * PostService 단위 테스트
 * - Mockito로 Repository를 가짜로 만들어 서비스 로직만 검증
 */
@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;
    @Mock
    private PostImageRepository postImageRepository;
    @Mock
    private PostLikeRepository postLikeRepository;
    @Mock
    private FileService fileService;
    @Mock
    private AiAnalysisService aiAnalysisService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PostService postService;

    private Member writer;
    private Member otherMember;
    private Post post;

    @BeforeEach
    void setUp() {
        writer = Member.builder()
                .email("writer@test.com")
                .password("encoded_pw")
                .username("작성자")
                .authority(Authority.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(writer, "id", 1L);

        otherMember = Member.builder()
                .email("other@test.com")
                .password("encoded_pw")
                .username("다른유저")
                .authority(Authority.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(otherMember, "id", 2L);

        post = Post.builder()
                .title("테스트 제목")
                .content("테스트 내용")
                .member(writer)
                .build();
        ReflectionTestUtils.setField(post, "id", 10L);
    }

    // --- getPost ---

    @Test
    @DisplayName("존재하지 않는 게시글 조회 시 POST_NOT_FOUND 예외가 발생한다")
    void getPost_whenNotFound_throwsPostNotFound() {
        // given
        given(postRepository.findPostWithDetailsById(anyLong())).willReturn(Optional.empty());

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> postService.getPost(999L));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.POST_NOT_FOUND);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("POST_001");
    }

    // --- validateWriter ---

    @Test
    @DisplayName("게시글 작성자가 아닌 경우 POST_NOT_WRITER 예외가 발생한다")
    void validateWriter_whenNotWriter_throwsPostNotWriter() {
        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> postService.validateWriter(post, otherMember));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.POST_NOT_WRITER);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("POST_002");
    }

    // --- deletePost ---

    @Test
    @DisplayName("게시글 삭제 시 작성자가 아니면 POST_NOT_WRITER 예외가 발생한다")
    void deletePost_whenNotWriter_throwsPostNotWriter() {
        // given
        given(postRepository.findPostById(10L)).willReturn(Optional.of(post));

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> postService.deletePost(10L, otherMember));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.POST_NOT_WRITER);
    }

    // --- createPostLike ---

    @Test
    @DisplayName("게시글 작성자 본인이 좋아요를 시도하면 POST_LIKE_FORBIDDEN 예외가 발생한다")
    void createPostLike_whenSelfLike_throwsForbidden() {
        // given : 좋아요 시도자와 게시글 작성자가 같은 경우
        given(postRepository.findPostById(10L)).willReturn(Optional.of(post));

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> postService.createPostLike(10L, writer)); // writer가 본인 게시글에 좋아요

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.POST_LIKE_FORBIDDEN);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("POST_LIKE_001");
    }

    @Test
    @DisplayName("이미 좋아요한 게시글에 다시 좋아요를 시도하면 POST_LIKE_FORBIDDEN 예외가 발생한다")
    void createPostLike_whenAlreadyLiked_throwsForbidden() {
        // given : otherMember가 이미 좋아요한 상태
        given(postRepository.findPostById(10L)).willReturn(Optional.of(post));
        given(postLikeRepository.existsByPostAndMember(post, otherMember)).willReturn(true);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> postService.createPostLike(10L, otherMember));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.POST_LIKE_FORBIDDEN);
    }

    // --- deletePostLike ---

    @Test
    @DisplayName("좋아요가 없는 상태에서 좋아요 취소를 시도하면 POST_LIKE_NOT_FOUND 예외가 발생한다")
    void deletePostLike_whenNotLiked_throwsNotFound() {
        // given : 좋아요가 존재하지 않는 상태
        given(postRepository.findPostById(10L)).willReturn(Optional.of(post));
        given(postLikeRepository.existsByPostAndMember(post, otherMember)).willReturn(false);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> postService.deletePostLike(10L, otherMember));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.POST_LIKE_NOT_FOUND);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("POST_LIKE_003");
    }
}
