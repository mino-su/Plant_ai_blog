package com.project.plant_parent.service;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.dto.MyPageResponseDto;
import com.project.plant_parent.entity.dto.PostResponseDto;
import com.project.plant_parent.repository.FollowRepository;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyPageService {
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    
    public MyPageResponseDto getMyPageInfo(Long memberId, Member currentMember){
        Member member = memberRepository.findById(memberId).orElseThrow(
                () -> new IllegalArgumentException("해당 유저가 존재하지 않습니다.")
        );

        long followings = followRepository.countByFromMember(member); // 내가 한 팔로우 수

        long followers = followRepository.countByToMember(member); // 나를 팔로우 하는 수

        boolean isFollowing = followRepository.existsByFromMemberAndToMember(currentMember, member);

        boolean isFollower = followRepository.existsByFromMemberAndToMember(member, currentMember);

        List<Post> posts = postRepository.findAllByMemberOrderByCreatedAtDesc(member);

        return MyPageResponseDto.of(member, posts, followers, followings ,isFollowing, isFollower);


    }
}
