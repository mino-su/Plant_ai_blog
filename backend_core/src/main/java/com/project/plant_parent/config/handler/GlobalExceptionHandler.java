package com.project.plant_parent.config.handler;

import com.project.plant_parent.config.exception.CustomException;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 프로젝트 전체의 컨트롤레에서 발생하는 예외를 한곳에서 잡음
@Slf4j
public class GlobalExceptionHandler {
    /**
     * CustomException 처리
     */
    @ExceptionHandler(CustomException.class)
    protected ResponseEntity<ErrorResponse> handleCustomException(CustomException exception) {
        log.warn("CustomException 발생 :{} = {}", exception.getErrorCode().getCode(),exception.getMessage());
        ErrorCode errorCode = exception.getErrorCode();

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(errorCode));


    }

    /**
     * 일반적인 예외
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleException(Exception exception) {

        log.error("Exception 발생: ", exception);

        // 사용자에게는 보안을 위해 상세 에러를 숨기고 규격화된 메세지만 보냄    
        return ResponseEntity
                .status(500)
                .body(new ErrorResponse("SERVER_ERROR", "서버 내부 오류가 발생했습니다."));
    }
}
