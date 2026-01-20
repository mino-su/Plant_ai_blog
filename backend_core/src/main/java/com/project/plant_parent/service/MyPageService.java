package com.project.plant_parent.service;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.dto.MyPageResponseDto;
import com.project.plant_parent.repository.FollowRepository;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyPageService {
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    
    public MyPageResponseDto getMyPageInfo(Long memberId){
        Member member = memberRepository.findById(memberId).orElseThrow(
                () -> new IllegalArgumentException("해당 유저가 존재하지 않습니다.")
        );

        int followers = followRepository.countByFromMember(member);

        int following = followRepository.countByToMember(member);

        List<Post> posts = postRepository.findAllByMemberOrderByCreatedAtDesc(member);

        return MyPageResponseDto.of(member, posts, followers, following);


    }
}
