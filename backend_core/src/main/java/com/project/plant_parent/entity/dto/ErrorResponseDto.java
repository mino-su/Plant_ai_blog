package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponseDto {
    @Builder.Default  // timestamp는 선언 시점에 초기화되므로 final 유지 가능
    private LocalDateTime timeStamp = LocalDateTime.now();

    private int status;
    private String code;
    private String message;

    public static ErrorResponseDto from(ErrorCode errorCode) {
        return ErrorResponseDto.builder()
                .status(errorCode.getStatus().value())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

    }
}
