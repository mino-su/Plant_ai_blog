package com.project.plant_parent.service;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.PostImage;
import com.project.plant_parent.entity.dto.PostRequestDto;
import com.project.plant_parent.entity.dto.PostResponseDto;
import com.project.plant_parent.entity.dto.PostUpdateRequestDto;
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
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본 읽기 전용
public class PostService {
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;

    // 파일 저장 경로(프로젝트 루트/uploads)
    private final String uploadDir = System.getProperty("user.dir")+"/uploads/";


    public PostResponseDto createPost(PostRequestDto postRequestDto, List<MultipartFile> images, Member member) throws IOException {
        // 1. Post 엔티티 생성 및 저장
        Post newPost = Post.builder()
                .title(postRequestDto.getTitle())
                .content(postRequestDto.getContent())
                .member(member)
                .build();

        postRepository.save(newPost);

        // 2. 이미지 파일 처리 및 저장
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                // 파일명 중복 방지
                String uuid = UUID.randomUUID().toString();
                String filename = uuid + "_" + image.getOriginalFilename();

                // 실제 파일 저장
                File saveFile = new File(uploadDir, filename);
                if(!saveFile.getParentFile().exists()){
                    saveFile.getParentFile().mkdirs();
                }
                image.transferTo(saveFile);

                // DB에 PostImage 엔티티 저장
                PostImage postImage = PostImage.builder()
                        .imageUrl("/images/" + filename) // 나중에 WebConfig에서 매핑 필요
                        .originalFileName(image.getOriginalFilename())
                        .post(newPost)
                        .build();
                postImageRepository.save(postImage);

            }
        }

        return new PostResponseDto(newPost);
    }


    // 전체 조회
    public List<PostResponseDto> getAllPosts() {
        // 작성일 기준 최신순 내림차순
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PostResponseDto::new)
                .collect(Collectors.toList());
    }


    // 아이디로 조회
    public PostResponseDto getPost(Long postId) {
        return new PostResponseDto(findPost(postId));
    }

    // 수정
    @Transactional
    public PostResponseDto update(Long postId, PostUpdateRequestDto postUpdateRequestDto, List<MultipartFile> newImages, Member member)
    throws IOException {
        Post post = findPost(postId);
        validateWriter(post, member);

        // 1. 텍스트 수정
        post.update(postUpdateRequestDto.getTitle(), postUpdateRequestDto.getContent());

        // 2. 이미지 삭제 로직
        // 사용자가 삭제하라고 보낸 ID리스트가 있다면
        if (postUpdateRequestDto.getDeleteImageIds() != null && !postUpdateRequestDto.getDeleteImageIds().isEmpty()) {
            // 현재글의 이미지 리스트에서 하나씩 검사
            List<PostImage> currentImages = post.getPostImages();
            Iterator<PostImage> iterator = currentImages.iterator();
            while (iterator.hasNext()) {
                PostImage image = iterator.next();
                // 삭제 목록에 포함된 이미지라면?
                if (postUpdateRequestDto.getDeleteImageIds().contains(image.getId())) {
                    // 실제 파일 삭제(디스크 정리)
                    deleteFile(image.getImageUrl());

                    // 이미지 리스트에서 제거
                    iterator.remove(); // orphanRemoval =true 이므로 DB에서도 제거
                }
            }
        }


        // 3. 이미지 추가 로직
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile image : newImages) {
                // 파일명 중복 방지
                String uuid = UUID.randomUUID().toString();
                String filename = uuid + "_" + image.getOriginalFilename();

                // 실제 파일 저장
                File saveFile = new File(uploadDir, filename);
                if (!saveFile.getParentFile().exists()) {
                    saveFile.getParentFile().mkdirs();
                }
                image.transferTo(saveFile);

                // DB에 PostImage 엔티티 저장
                PostImage postImage = PostImage.builder()
                        .imageUrl("/images/" + filename) // 나중에 WebConfig에서 매핑 필요
                        .originalFileName(image.getOriginalFilename())
                        .post(post)
                        .build();
                postImageRepository.save(postImage);


            }
        }
        return new PostResponseDto(post);
    }

    //삭제
    @Transactional
    public void deletePost(Long postId, Member member) {
        Post post = findPost(postId);
        validateWriter(post, member);

        // 연관 댓글, 이미지, 좋야요는 CascadeType.All에 의해 자동으로 삭제
        postRepository.delete(post);
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

    public void deleteFile(String imageUrl) {
        // imageUrl ex) "/images/uuid_cat.jpg"

        String fileName = imageUrl.substring(8);// "/images/" 부분 제거

        // String 경로 -> Path 객체로 변환
        Path filePath = Paths.get(uploadDir, fileName);
        try {
            boolean result = Files.deleteIfExists(filePath);

            if(result){
                log.info("파일 삭제 성공: {}", fileName);
            } else{
                log.info("파일이 존재하지 않음: {}", fileName);
            }

        } catch (IOException e) {
            // 권한 문제, 잠긴 파일 등 실패시 예외 발생
            log.error("파일 삭제 실패: {}", fileName, e);
        }
    }




}
