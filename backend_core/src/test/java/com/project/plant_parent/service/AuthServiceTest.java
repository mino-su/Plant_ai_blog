package com.project.plant_parent.service;

import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.dto.MemberRequestDto;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.repository.MemberRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;


import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

/**
 * 서비스 레이어 예외 테스트
 * 1. Mockito를 사용해 가짜(Mock)repository 만듦
 * 2. 특정 조건(ex. 이메일 중복)에서 BusinessException이 실제로 발생하는지 확인
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("중복 이메일 가입 시도시 USER_002 예외가 발생하는지")
    void signup_duplicate_email_exception() {
        // Given : 이미 이메일이 존재한다고 가정(Mocking)
        given(memberRepository.existsByEmail(anyString())).willReturn(true);
        MemberRequestDto requestDto = new MemberRequestDto("test@test.com", "1234", "tester");

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, () ->
                {
                    authService.signup(requestDto);
                }
        );
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MEMBER_EMAIL_ALREADY_EXISTS);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("USER_002");
    }
}