package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.ErrorCode;
import lombok.Builder;
import lombok.Getter;

@Getter
public class ErrorResponse {
    private final String code ; // ex) U001
    private final String message; // ex) 유저가 존재하지 않습니다.

    @Builder
    public ErrorResponse(String code, String message) {
        this.code= code;
        this.message = message;
    }

    // ErrorCode를 받아서 ErrorResponse 생성
    public static ErrorResponse of(ErrorCode errorCode) {
        return ErrorResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
    }
}
