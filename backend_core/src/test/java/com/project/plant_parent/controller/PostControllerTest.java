package com.project.plant_parent.controller;

import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.service.PostService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;

/**
 * 전역 핸들러 최종 테스트
 * 1. MockMvc를 사용해서 가짜 Http 요청을 보냄
 * 2. 서비스에서 예외가 터졌을때, GlobalExceptionHandler가 가로채서 JSON으로 바꾸는지 확인
 */
@WebMvcTest(PostController.class) // 테스트 할 대상을 컨트롤러로 지정
class PostControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PostService postService;

    @Test
    @WithMockUser // 인증된 사용자로 가정
    @DisplayName("게시글이 없을때 404 응답과 POST_001 코드가 반환 되는가")
    void handlePostNotFount_test() throws Exception {
        // Given : 세비스 호출시 무조건 POST_NOT_FOUND 예외를 던지도록 설정
        given(postService.getPost(anyLong()))
                .willThrow(new BusinessException(ErrorCode.POST_NOT_FOUND));

        // When & Then
        mockMvc.perform(get("/api/posts/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("POST_001"))
                .andExpect(jsonPath("$.message").value("게시글이 존재하지 않습니다."));
    }



}