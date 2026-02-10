package com.project.plant_parent.service;

import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Follow;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.dto.FollowResponseDto;
import com.project.plant_parent.repository.FollowRepository;
import com.project.plant_parent.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용으로 설정
public class FollowService {
    private final FollowRepository followRepository;
    private final MemberRepository memberRepository;


    @Transactional
    public FollowResponseDto createFollow(Member currentMember, Long toMemberId) {


        if(currentMember.getId().equals(toMemberId)){
            // 자기 자신이 아닌 경우
            throw new BusinessException(ErrorCode.FOLLOW_SELF_LIMIT);
        }

        Member toMember = getMember(toMemberId);


        if (followRepository.existsByFromMemberAndToMember(currentMember, toMember)) {
            // 이미 팔로우를 한 경우
            throw new BusinessException(ErrorCode.FOLLOW_ALREADY_EXIST);
        }


        Follow follow = Follow.builder()
                            .fromMember(currentMember)
                            .toMember(toMember)
                            .build();

        Follow save = followRepository.save(follow);

        return FollowResponseDto.from(save);

    }

    @Transactional
    public void deleteFollow(Member currentMember, Long toMemberId) {
        Member toMember = getMember(toMemberId);

        if (!followRepository.existsByFromMemberAndToMember(currentMember, toMember)) {
            throw  new BusinessException(ErrorCode.FOLLOW_NOT_FOUND);
        }


        followRepository.deleteByFromMemberAndToMember(currentMember, toMember);
        log.info("팔로우가 취소 완료.  {} -> {}", currentMember.getUsername(), toMember.getUsername());


    }


    // 나를 팔로우한 사람들 조회
    public List<FollowResponseDto> getFollowers(Long memberId) {

        Member member = getMember(memberId);

        return followRepository.findAllByToMember(member).stream()
                .map(FollowResponseDto::from)
                .collect(Collectors.toList());
    }

    // 내가 팔로잉 한 사람들 조회
    public List<FollowResponseDto> getFollowings(Long memberId) {
        Member member = getMember(memberId);

        return followRepository.findAllByFromMember(member).stream()
                .map(FollowResponseDto::from)
                .collect(Collectors.toList());
    }

    private @NonNull Member getMember(Long memberId) {
        return memberRepository.findById(memberId).orElseThrow(
                () -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND)
        );
    }
}
