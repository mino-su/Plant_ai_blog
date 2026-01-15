package com.project.plant_parent.controller;

import com.project.plant_parent.entity.dto.AiAnalysisResponseDto;
import com.project.plant_parent.entity.dto.PostRequestDto;
import com.project.plant_parent.entity.dto.PostResponseDto;
import com.project.plant_parent.entity.dto.PostUpdateRequestDto;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.service.PostService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    // 게시글 생성
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<PostResponseDto> createPost(
            @RequestPart("post") PostRequestDto postRequestDto,
            @RequestPart(value = "image", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) throws IOException {

        PostResponseDto response = postService.createPost(postRequestDto, images, userDetails.getMember());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }

    // 이미지 별 AI 분석 요청
    @GetMapping("/images/{imageId}/analyze")
    public ResponseEntity<AiAnalysisResponseDto> analyzeImage(@PathVariable Long imageId) {
        AiAnalysisResponseDto result = postService.analyzeImage(imageId);
        return ResponseEntity.ok(result);
    }

    // 전체 게시글 조회
    @GetMapping("")
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {

        return ResponseEntity.ok(postService.getAllPosts());
    }

    // 특정 게시물 조회
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostWithPostId(@PathVariable("postId") Long postId) {
        return ResponseEntity.ok(postService.getPost(postId));
    }

    // 게시글 삭제
    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable("postId") Long postId,
                                             @AuthenticationPrincipal UserDetailsImpl userDetails) {
        postService.deletePost(postId, userDetails.getMember());
        return ResponseEntity.ok("게시글 삭제 완료");
    }

    // 게시글 수정
    @PutMapping(value="/{postId}",
    consumes ={MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<PostResponseDto> updatePost(
            @PathVariable Long postId,
            @RequestPart("post") PostUpdateRequestDto postupdateRequestDto,
            @RequestPart(value="image", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) throws IOException{
        return ResponseEntity.ok(postService.update(postId, postupdateRequestDto, images, userDetails.getMember()));
    }

}
