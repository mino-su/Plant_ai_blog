package com.project.plant_parent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.plant_parent.entity.Authority;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.dto.CommentRequestDto;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.config.SecurityConfig;
import com.project.plant_parent.service.CommentService;
import com.project.plant_parent.util.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * CommentController 통합 테스트 (MockMvc)
 * - UserDetailsImpl을 직접 주입하여 @AuthenticationPrincipal 처리
 * - 댓글 생성, 삭제의 예외 응답을 검증
 */
@WebMvcTest(CommentController.class)
@Import(SecurityConfig.class)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CommentService commentService;

    // SecurityConfig 의존성
    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    @SuppressWarnings("unchecked")
    private RedisTemplate<String, String> redisTemplate;

    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        Member member = Member.builder()
                .email("user@test.com")
                .password("pw")
                .username("테스터")
                .authority(Authority.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(member, "id", 1L);
        userDetails = new UserDetailsImpl(member);
    }

    @Test
    @DisplayName("작성자가 아닌 사용자가 댓글 삭제 시도 시 403 Forbidden과 COMMENT_002 코드가 반환된다")
    void deleteComment_whenNotWriter_throwsForbidden() throws Exception {
        // given : void 메서드이므로 willThrow(...).given(...).method() 문법 사용
        willThrow(new BusinessException(ErrorCode.COMMENT_NOT_WRITER))
                .given(commentService).delete(anyLong(), any(Member.class));

        // when & then : UserDetailsImpl을 직접 주입하여 인증 처리
        mockMvc.perform(delete("/api/comments/999")
                        .with(user(userDetails)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("COMMENT_002"))
                .andExpect(jsonPath("$.message").value("댓글 작성자만 수정/삭제 할 수 있습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 게시글에 댓글 작성 시도 시 404 Not Found와 POST_001 코드가 반환된다")
    void createComment_whenPostNotFound_throwsNotFound() throws Exception {
        // given
        given(commentService.createComment(anyLong(), any(CommentRequestDto.class), any(Member.class)))
                .willThrow(new BusinessException(ErrorCode.POST_NOT_FOUND));

        CommentRequestDto requestDto = new CommentRequestDto("댓글 내용", null);

        // when & then
        mockMvc.perform(post("/api/posts/999/comments")
                        .with(user(userDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("POST_001"))
                .andExpect(jsonPath("$.message").value("게시글이 존재하지 않습니다."));
    }
}
