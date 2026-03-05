package com.project.plant_parent.service;

import com.project.plant_parent.entity.Profile;
import com.project.plant_parent.entity.dto.FollowListResponseDto;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Follow;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.dto.FollowResponseDto;
import com.project.plant_parent.repository.FollowRepository;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용으로 설정
public class FollowService {
    private final FollowRepository followRepository;
    private final MemberRepository memberRepository;
    private final ProfileRepository profileRepository;
    private final NotificationService notificationService;


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

        try {
            Follow follow = Follow.builder()
                    .fromMember(currentMember)
                    .toMember(toMember)
                    .build();

            Follow save = followRepository.save(follow);

            String message = currentMember.getUsername() + "님이 회원님을 팔로우하기 시작했습니다.";
            notificationService.notify(toMemberId, message, "follow");

            return FollowResponseDto.from(save);
        } catch (DataIntegrityViolationException e) {
            // 찰나의 순간 동시성 요청이 와서 유니크 제약 조건을 건드릴 경우 예외 던짐
            log.warn("[동시성 차단] currentMemberId = {}, toMemberId = {}", currentMember.getId(), toMemberId);
            throw new BusinessException(ErrorCode.FOLLOW_ALREADY_EXIST);
        }
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

    // 타겟의 팔로잉 한 사람들 목록 조회 (현재 사용자가 팔로잉 한 사람들이 있는지도 체크)
    public List<FollowListResponseDto> getFollowings(Long targetId, Member currentMember) {
        // 타겟
        Member targetMember = getMember(targetId);

        // 타겟의 팔로잉 리스트
        List<Follow> targetFollowingList = followRepository.findAllByFromMember(targetMember);

        // 현재 로그인 멤버의 팔로잉 멤버 ID 리스트
        Set<Long> currentMemberFollowingIdList = followRepository.findAllToMemberIdsByFromMember(currentMember);

        // 대조해서 DTO 조립
        return targetFollowingList.stream()
                .map(
                        follow -> {
                            Member toMember = follow.getToMember();
                            boolean isFollowing = currentMemberFollowingIdList.contains(toMember.getId());
                            Profile profile = toMember.getProfile();
                            return FollowListResponseDto.of(toMember, profile, isFollowing);
                        }
                ).collect(Collectors.toList());

    }

    // 타겟의 팔로우 한 사람들 목록 조회 (현재 사용자가 팔로잉 한 사람들이 있는지도 체크)
    public List<FollowListResponseDto> getFollowers(Long targetId, Member currentMember) {
        // 타겟
        Member targetMember = getMember(targetId);
        
        // 타겟의 팔로우 리스트
        List<Follow> targetFollowerList = followRepository.findAllByToMember(targetMember);
        
        // 현재 로그인 한 멤버의 팔로잉 Id List
        Set<Long> currentMemberFollowingIdList = followRepository.findAllToMemberIdsByFromMember(currentMember);
        
        // 대조해서 DTO 조립
        return targetFollowerList.stream()
                .map(
                        follow -> {
                            Member fromMember = follow.getFromMember();
                            boolean isFollowing = currentMemberFollowingIdList.contains(fromMember.getId());
                            Profile profile = fromMember.getProfile();
                            return FollowListResponseDto.of(fromMember, profile, isFollowing);
                        }
                ).collect(Collectors.toList());

    }



    private @NonNull Member getMember(Long memberId) {
        return memberRepository.findById(memberId).orElseThrow(
                () -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND)
        );
    }
}
