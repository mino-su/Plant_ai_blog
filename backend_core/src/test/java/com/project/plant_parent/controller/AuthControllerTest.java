package com.project.plant_parent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.plant_parent.config.SecurityConfig;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.dto.LoginRequestDto;
import com.project.plant_parent.entity.dto.MemberRequestDto;
import com.project.plant_parent.entity.dto.MemberResponseDto;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.service.AuthService;
import com.project.plant_parent.util.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * AuthController 통합 테스트 (MockMvc)
 * - 회원가입, 로그인의 성공/예외 응답을 검증
 * - /auth/** 는 SecurityConfig에서 permitAll() 으로 설정됨
 * - @Import(SecurityConfig.class)로 커스텀 시큐리티 설정을 명시적으로 로드
 */
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    // SecurityConfig 의존성
    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    @SuppressWarnings("unchecked")
    private RedisTemplate<String, String> redisTemplate;

    @Test
    @DisplayName("정상 회원가입 시 200 OK와 이메일/닉네임이 반환된다")
    void signup_success() throws Exception {
        // given
        MemberRequestDto requestDto = new MemberRequestDto("new@test.com", "password123", "새유저");
        MemberResponseDto responseDto = MemberResponseDto.builder()
                .email("new@test.com")
                .username("새유저")
                .build();
        given(authService.signup(any(MemberRequestDto.class))).willReturn(responseDto);

        // when & then
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@test.com"))
                .andExpect(jsonPath("$.username").value("새유저"));
    }

    @Test
    @DisplayName("중복 이메일로 회원가입 시 409 Conflict와 USER_002 코드가 반환된다")
    void signup_duplicateEmail() throws Exception {
        // given
        MemberRequestDto requestDto = new MemberRequestDto("existing@test.com", "password", "유저");
        given(authService.signup(any(MemberRequestDto.class)))
                .willThrow(new BusinessException(ErrorCode.MEMBER_EMAIL_ALREADY_EXISTS));

        // when & then
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("USER_002"))
                .andExpect(jsonPath("$.message").value("이미 가입된 이메일 주소 입니다."));
    }

    @Test
    @DisplayName("잘못된 비밀번호로 로그인 시 401 Unauthorized와 AUTH_005 코드가 반환된다")
    void login_failed() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto("user@test.com", "wrongpassword");
        given(authService.login(any(LoginRequestDto.class)))
                .willThrow(new BusinessException(ErrorCode.LOGIN_FAILED));

        // when & then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_005"))
                .andExpect(jsonPath("$.message").value("아이디 또는 비밀번호가 일치하지 않습니다."));
    }
}
