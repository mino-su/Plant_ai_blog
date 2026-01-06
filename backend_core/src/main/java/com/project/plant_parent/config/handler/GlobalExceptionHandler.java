package com.project.plant_parent.config.handler;

import com.project.plant_parent.config.exception.CustomException;
import com.project.plant_parent.entity.ErrorCode;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 프로젝트 전체의 컨트롤레에서 발생하는 예외를 한곳에서 잡음
public class GlobalExceptionHandler {
    @ExceptionHandler(CustomException.class)
    protected void handleCustomException(CustomException exception) {
        ErrorCode errorCode = exception.getErrorCode();

    }
}
