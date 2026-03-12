package com.project.plant_parent.service;

import com.project.plant_parent.entity.*;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.entity.dto.*;
import com.project.plant_parent.repository.PostImageRepository;
import com.project.plant_parent.repository.PostLikeRepository;
import com.project.plant_parent.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final FileService fileService;
    private final AiAnalysisService aiAnalysisService;
    private final PostLikeRepository postLikeRepository;
    private final NotificationService notificationService;


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
                PostImage postImage = getImage(imageId);

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


    // 아이디로 조회
    public PostResponseDto getPost(Long postId) {

        // 상세 조회 버전
        Post post = postRepository.findPostWithDetailsById(postId).orElseThrow(
                () -> new BusinessException(ErrorCode.POST_NOT_FOUND)
        );

        return PostResponseDto.from(post);
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
                PostImage newImage= getImage(imageId);
                newImage.mappingPost(post);
            }
        }

        return PostResponseDto.from(post);
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
        PostImage postImage = getImage(imageId);

        return aiAnalysisService.getFullAnalysis(postImage);
    }

    @Transactional
    public PostLikeDto createPostLike(Long postId, Member currentMember) {
        //  게시글이 존재하는지 확인
        Post post = findPost(postId);

        //  현재 멤버가 게시글의 작성자 인지 확인(자기 자신은 게시글 좋아요 금지)
        if (post.getMember().getId().equals(currentMember.getId())) {
            throw new BusinessException(ErrorCode.POST_LIKE_FORBIDDEN);
        }

        //  postlikeRepository에 저장
        PostLike postlike = PostLike.builder()
                .member(currentMember)
                .post(post)
                .build();

        try {
            PostLike save = postLikeRepository.save(postlike);

            String message = currentMember.getUsername() + "님이 회원님의 게시글을 좋아합니다.";
            notificationService.notify(post.getMember().getId(), message, "like", post.getId());

            long totalCount = postLikeRepository.countPostLikesByPost(post);

            return PostLikeDto.of(save.getPost().getId(), true, totalCount);
        } catch (DataIntegrityViolationException e) {
            // 찰나의 순간에 동시에 요청이 와서 유니크 제약조건을 건드릴 경우 예외
            log.warn("[동시성 차단] memberId = {}, postId= {}", currentMember.getId(), post.getId());
            throw new BusinessException(ErrorCode.POST_LIKE_ALREADY_EXISTS);
        }
    }


    @Transactional
    public PostLikeDto deletePostLike(Long postId, Member currentMember) {
        // 1. 게시글이 있는지 확인
        Post post = findPost(postId);
        // 2. 좋아요가 있는지 확인
        if (!postLikeRepository.existsByPostAndMember(post, currentMember)) {
            throw new BusinessException(ErrorCode.POST_LIKE_NOT_FOUND);
        }
        // 3. 좋아요 삭제
        postLikeRepository.deleteByPostAndMember(post, currentMember);

        long totalCount = postLikeRepository.countPostLikesByPost(post);
        return PostLikeDto.of(post.getId(), false, totalCount);

    }


    public PostLikeDto getPostLike(Long postId, Member currentMember) {
        // 게시글이 있는지 확인
        Post post = findPost(postId);

        boolean isLiked = false;

        // 현재 로그인 된 사용자의 경우 좋아요가 되어있는지 확인
        if (currentMember != null) {
            Set<Long> likePostIds = postLikeRepository.findPostIdsByMember(currentMember);
            isLiked = likePostIds.contains(post.getId());
        }
        long totalCount = postLikeRepository.countPostLikesByPost(post);
        return PostLikeDto.of(post.getId(), isLiked, totalCount);
    }

    // 이미지 삭제
    public void deleteFileByUrl(String imageUrl) {
        String fileName = imageUrl.replace("/images/", "");

        fileService.deleteFile(fileName);
    }

    // 전체 조회 - 페이징 적용
    public Page<PostResponseDto> getPostList(Pageable pageable) {
        Page<Post> posts = postRepository.findAllWithPaging(pageable);
        return posts.map(PostResponseDto::from);
    }

    // 검색 기능
    public Page<PostResponseDto> search(PostSearchConditionDto searchCondition, Pageable pageable) {
        Page<Post> searchPosts = postRepository.search(searchCondition, pageable);
        return searchPosts.map(PostResponseDto::from);
    }

    // [공통 메서드] 게시글 찾기
    public Post findPost(Long postId) {
        return postRepository.findPostById(postId).orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    }

    //[공통 메서드] 작성자 검증
    public void validateWriter(Post post, Member member) {
        if (!post.getMember().getId().equals(member.getId())) {
            throw new BusinessException(ErrorCode.POST_NOT_WRITER);
        }
    }

    // [공통 메서드] 이미지 찾기
    private @NonNull PostImage getImage(Long imageId) {
        return postImageRepository.findById(imageId).orElseThrow(
                () -> new BusinessException(ErrorCode.IMAGE_NOT_FOUND)
        );
    }



}





