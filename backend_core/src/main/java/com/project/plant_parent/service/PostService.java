package com.project.plant_parent.service;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.PostImage;
import com.project.plant_parent.entity.dto.*;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.PostImageRepository;
import com.project.plant_parent.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final FlaskService flaskService;
    private final FileService fileService;


    // Refactor: 리액트에서 보낸 json 본문을 그대로 저장
    // 같이 보낸 imageIds 리스트를 통해 미리 올라간 사진들을 mapping
    @Transactional
    public PostResponseDto createPost(PostRequestDto postRequestDto, Member member){
        // 1. Post 엔티티 생성 및 저장
        Post newPost = Post.builder()
                .title(postRequestDto.getTitle())
                .content(postRequestDto.getContent())
                .member(member)
                .build();

        Post savedPost = postRepository.save(newPost);

        // 미리 올린 이미지와 연결
        if (postRequestDto.getImageIds() != null && !postRequestDto.getImageIds().isEmpty()) {
            for (Long imageId : postRequestDto.getImageIds()) {
                PostImage postImage = postImageRepository.findById(imageId).orElseThrow(
                        () -> new IllegalArgumentException("존재하지 않는 이미지 Id 입니다." + imageId)
                );

                // postImage에 post 매핑, 이제 postId가 null이 아님
                postImage.mappingPost(savedPost);
            }
        }

        return PostResponseDto.from(savedPost);
    }

 // 이미지 파일 저장
    @Transactional
    public PostImageDto saveImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            throw new IOException("업로드 할 이미지 파일이 비어있습니다.");
        }

        String filename = fileService.saveFile(image);

        // DB에는 이미지 경로와 기본 상태만 저장

        PostImage postImage = PostImage.builder()
                                .imageUrl("/images/" + filename)
                                .originalFileName(image.getOriginalFilename())
                                .plant("분석 대기중...")
                                .disease("분석 대기중...")
                                .build();
        // 지금은 .post(null)인 상태로 저장되지만 나중에 저장 api가 호출될때 Id를 찾아 연결

        postImageRepository.save(postImage);
        return PostImageDto.from(postImage);

    }


    // 전체 조회
    public List<PostResponseDto> getAllPosts() {
        // 작성일 기준 최신순 내림차순
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PostResponseDto::from)
                .collect(Collectors.toList());
    }


    // 아이디로 조회
    public PostResponseDto getPost(Long postId) {
        return PostResponseDto.from(findPost(postId));
    }

    // 수정
    @Transactional
    public PostResponseDto update(Long postId, PostUpdateRequestDto postUpdateRequestDto, Member member)
    throws IOException {
        Post post = findPost(postId);
        validateWriter(post, member);

        // 1. 텍스트 수정
        post.update(postUpdateRequestDto.getTitle(), postUpdateRequestDto.getContent());

        // 2. 이미지 삭제 로직
        // 사용자가 삭제하라고 보낸 ID리스트가 있다면
        if (postUpdateRequestDto.getDeleteImageIds() != null && !postUpdateRequestDto.getDeleteImageIds().isEmpty()) {
            List<PostImage> currentImages = post.getPostImages();
            currentImages.removeIf(
                    image -> {
                        if (postUpdateRequestDto.getDeleteImageIds().contains(image.getId())) {
                            // 실제 파일 삭제
                            deleteFileByUrl(image.getImageUrl());
                            return true; // 리스트에서 제거
                        }
                        return false;
                    }
            );
        }



        // 이미지 추가 로직
        // 수정 중에 에디터에서 미리 추가한 사진들의 id를 가져와 post를 Mapping
        if (postUpdateRequestDto.getNewImageIds() != null && !postUpdateRequestDto.getNewImageIds().isEmpty()) {
            for (Long imageId : postUpdateRequestDto.getNewImageIds()) {
                PostImage newImage= postImageRepository.findById(imageId).orElseThrow(
                        () -> new IllegalArgumentException("이미지가 존재하지 않습니다." + imageId)
                );
                newImage.mappingPost(post);
            }
        }

        return PostResponseDto.from(post);
    }

    public void deleteFileByUrl(String imageUrl) {
        String fileName = imageUrl.replace("/images/", "");

        fileService.deleteFile(fileName);
    }

    //삭제
    @Transactional
    public void deletePost(Long postId, Member member) {
        Post post = findPost(postId);
        validateWriter(post, member);

        // 연관 댓글, 이미지, 좋야요는 CascadeType.All에 의해 자동으로 삭제
        postRepository.delete(post);
    }


    @Transactional
    public AiAnalysisResponseDto analyzeImage(Long imageId) {
        PostImage postImage = postImageRepository.findById(imageId).orElseThrow(
                () -> new IllegalArgumentException("이미지를 찾을 수 없습니다. ID: " + imageId)
        );

        String fileName = postImage.getImageUrl().replace("/images/", "");

        // flask 서버로 분석 요청을 보냄
        try {
            FlaskResponseDto aiResult = flaskService.analyzeImage(fileName);
            if (aiResult != null && "success".equals(aiResult.getStatus())) {
                String plant = aiResult.getResults().getPlant_detection().get(0).getLabel();
                Double confidence = aiResult.getResults().getDisease_analysis().get(0).getConfidence();
                String disease = aiResult.getResults().getDisease_analysis().get(0).getLabel();

                postImage.updateAiResult(plant, disease, confidence);
            }


        } catch (Exception e) {
            log.error("AI 분석 중 오류 발생: {}", e.getMessage());
            postImage.updateAiResult("분석 실패", "분석 실패", 0.0);
        }

        return AiAnalysisResponseDto.from(postImage);
    }

    // [공통 메서드] 게시글 찾기
    public Post findPost(Long postId) {
        return postRepository.findPostById(postId).orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
    }

    //[공통 메서드] 작성자 검증
    public void validateWriter(Post post, Member member) {
        if (!post.getMember().getId().equals(member.getId())) {
            throw new IllegalArgumentException("작성자만 수정/삭제 할 수 있습니다.");
        }
    }





}





