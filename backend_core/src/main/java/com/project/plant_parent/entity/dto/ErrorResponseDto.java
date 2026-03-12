package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponseDto {
    @Builder.Default
    private LocalDateTime timeStamp = LocalDateTime.now();

    private int status;
    private String code;
    private String message;

    private List<FieldErrorDetail> fieldErrors;

    public static ErrorResponseDto from(ErrorCode errorCode) {
        return ErrorResponseDto.builder()
                .status(errorCode.getStatus().value())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

    }

    @Getter
    @AllArgsConstructor
    public static class FieldErrorDetail{
        private String field;
        private String message;
    }
}
