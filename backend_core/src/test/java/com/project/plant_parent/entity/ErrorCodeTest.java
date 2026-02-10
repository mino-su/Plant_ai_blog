package com.project.plant_parent.entity;

import com.project.plant_parent.entity.dto.ErrorResponseDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 정의한 상수값이 변하지 않았는지, DTO 변환 로직에 오타가 없는지
 */
class ErrorCodeTest {
    @Test
    @DisplayName("ErrorCode가 올바른 정보를 가지고 있는지 확인")
    void errorCode_values_test(){
        //Given
        ErrorCode target = ErrorCode.MEMBER_NOT_FOUND;

        //Then
        assertThat(target.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(target.getCode()).isEqualTo("USER_001");
        assertThat(target.getMessage()).isEqualTo("존재하지 않는 사용자입니다.");
    }

    @Test
    @DisplayName("ErrorCode를 DTO로 변환할 때 데이터 유실이 없는지 확인")
    void errorResponseDto_from_test() {
        // Given
        ErrorCode code = ErrorCode.MEMBER_EMAIL_ALREADY_EXISTS;

        // When
        ErrorResponseDto response = ErrorResponseDto.from(code);

        // Then
        assertThat(response.getStatus()).isEqualTo(409); // CONFLICT
        assertThat(response.getCode()).isEqualTo("USER_002");
        assertThat(response.getMessage()).isEqualTo(code.getMessage());
        assertThat(response.getTimeStamp()).isNotNull(); // 자동 생성 확인

    }

}