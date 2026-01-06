package com.project.plant_parent.entity;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // 유저 관련 에러
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "존재하지 않는 사용자입니다."),
    // AI 서버 관련 에러
    AI_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,"A001", "AI 서버와의 통신 중 오류가 발생했습니다."),
    // 공통 에러
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST,"C001","잘못된 요청 양식입니다.");

    private final HttpStatus status; // http 상태 코드
    private final String code; //  에러코드
    private final String message; // 에러 메세지

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }


}
