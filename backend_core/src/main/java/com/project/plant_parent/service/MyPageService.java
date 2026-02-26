package com.project.plant_parent.service;

import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.dto.MyPageResponseDto;
import com.project.plant_parent.repository.FollowRepository;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.PostLikeRepository;
import com.project.plant_parent.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyPageService {
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    private final PostLikeRepository postLikeRepository;
    
    public MyPageResponseDto getMyPageInfo(Long memberId, Member currentMember){
        Member member = memberRepository.findById(memberId).orElseThrow(
                () -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND)
        );


        long followings = followRepository.countByFromMember(member); // 내가 한 팔로우 수

        long followers = followRepository.countByToMember(member); // 나를 팔로우 하는 수

        boolean isFollowing = false;
        boolean isFollower = false;

        if (currentMember != null) {
            isFollowing = followRepository.existsByFromMemberAndToMember(currentMember, member);
            isFollower = followRepository.existsByFromMemberAndToMember(member, currentMember);
        }


        List<Post> posts = postRepository.findAllByMemberOrderByCreatedAtDesc(member);



        return MyPageResponseDto.of(member, posts, followers, followings ,isFollowing, isFollower);


    }
}
