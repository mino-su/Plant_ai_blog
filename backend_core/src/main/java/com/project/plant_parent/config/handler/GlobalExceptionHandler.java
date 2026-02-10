package com.project.plant_parent.config.handler;

import com.project.plant_parent.config.exception.BusinessException;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.dto.ErrorResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    protected ResponseEntity<ErrorResponseDto> handleCustomException(BusinessException exception) {
        log.warn(">> [BusinessException] :{} = {}", exception.getErrorCode().getCode(),exception.getMessage());
        ErrorCode errorCode = exception.getErrorCode();

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponseDto.from(errorCode));

    }


    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponseDto> handleException(Exception exception) {
        // 반드시 error 레벨로 로그 남기는 것 필수
        log.error("Exception 발생: ", exception);

        ErrorCode errorCode = ErrorCode.GLOBAL_INTERNAL_ERROR;

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponseDto.from(errorCode));
    }
}
