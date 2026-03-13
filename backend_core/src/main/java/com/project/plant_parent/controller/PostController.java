package com.project.plant_parent.controller;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.dto.*;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.service.PostService;
import jakarta.validation.Valid;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
@Slf4j
public class PostController {
    private final PostService postService;

    // 게시글 생성
    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(
            @RequestBody @Valid PostRequestDto postRequestDto,
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
        return ResponseEntity.ok(result);
    }

    // 전체 게시글 조회
    @GetMapping("")
    public ResponseEntity<Page<PostResponseDto>> getAllPosts(
            @PageableDefault(size = 6, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {

        return ResponseEntity.ok(postService.getPostList(pageable));
    }

    @GetMapping("/popular")
    public ResponseEntity<Page<PostResponseDto>> getAllPostsOrderByLike(
            @PageableDefault(size = 6) Pageable pageable
    ) {
        return ResponseEntity.ok(postService.getPostListOrderByLikes(pageable));
    }

    // 특정 게시물 조회
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostWithPostId(
            @PathVariable("postId") Long postId) {

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
            @RequestBody @Valid PostUpdateRequestDto postupdateRequestDto,
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

    // 게시글 좋아요
    @PostMapping("/{postId}/like")
    public ResponseEntity<PostLikeDto> createPostLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Member currentMember = userDetails.getMember();
        PostLikeDto postLike = postService.createPostLike(postId, currentMember);
        return ResponseEntity.status(HttpStatus.CREATED).body(postLike);
    }

    // 게시글 좋아요 삭제
    @DeleteMapping("/{postId}/like")
    public ResponseEntity<PostLikeDto> deletePostLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Member currentMember = userDetails.getMember();
        PostLikeDto postLikeDto = postService.deletePostLike(postId, currentMember);
        log.info("좋아요가 취소되었습니다. postId: {} , memberId: {}", postId, currentMember.getId());
        return ResponseEntity.ok(postLikeDto);
    }

    // 게시글 좋아요 조회
    @GetMapping("/{postId}/like")
    public ResponseEntity<PostLikeDto> getPostLike(
            @PathVariable("postId")Long postId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Member currentMember = (userDetails != null) ? userDetails.getMember() : null;
        PostLikeDto postLike = postService.getPostLike(postId, currentMember);
        return ResponseEntity.ok(postLike);
    }
}
