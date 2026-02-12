package com.project.plant_parent.controller;

import com.project.plant_parent.entity.dto.*;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.service.PostService;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
@Slf4j
public class PostController {
    private final PostService postService;

    // 게시글 생성
    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(
            @RequestBody PostRequestDto postRequestDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {

        PostResponseDto response = postService.createPost(postRequestDto, userDetails.getMember());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }


    // 게시글 이미지 업로드
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostImageDto> uploadPostImages(
            @RequestPart(value = "image") MultipartFile image
    ) throws IOException {
        // 에디터는 파일을 한장식 보냄.
        PostImageDto postImageDtos = postService.saveImage(image);
        return ResponseEntity.ok(postImageDtos);
    }

    // 이미지 별 AI 분석 요청
    @GetMapping("/images/{imageId}/analyze")
    public ResponseEntity<AiAnalysisResponseDto> analyzeImage(@PathVariable Long imageId) {
        AiAnalysisResponseDto result = postService.analyzeImage(imageId);
        log.info(">>> PostController");
        return ResponseEntity.ok(result);
    }

    // 전체 게시글 조회
    @GetMapping("")
    public ResponseEntity<Page<PostResponseDto>> getAllPosts(
            @PageableDefault(size = 6, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(postService.getPostList(pageable));
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
    @PutMapping(value = "/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(
            @PathVariable Long postId,
            @RequestBody PostUpdateRequestDto postupdateRequestDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) throws IOException {
        return ResponseEntity.ok(postService.update(postId, postupdateRequestDto, userDetails.getMember()));
    }

    // 검색기능
    @GetMapping("/search")
    public ResponseEntity<Page<PostResponseDto>> searchPost(
            @ModelAttribute PostSearchConditionDto searchCondition,
            @PageableDefault(size = 6, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<PostResponseDto> search = postService.search(searchCondition, pageable);
        return ResponseEntity.ok(search);
    }
}
