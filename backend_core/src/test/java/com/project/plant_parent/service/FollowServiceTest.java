package com.project.plant_parent.service;

import com.project.plant_parent.entity.Authority;
import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.repository.FollowRepository;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;

/**
 * FollowService 단위 테스트
 * - 팔로우 생성/삭제의 핵심 예외 흐름을 검증
 */
@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock
    private FollowRepository followRepository;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FollowService followService;

    private Member memberA;
    private Member memberB;

    @BeforeEach
    void setUp() {
        memberA = Member.builder()
                .email("a@test.com")
                .password("pw")
                .username("유저A")
                .authority(Authority.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(memberA, "id", 1L);

        memberB = Member.builder()
                .email("b@test.com")
                .password("pw")
                .username("유저B")
                .authority(Authority.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(memberB, "id", 2L);
    }

    // --- createFollow ---

    @Test
    @DisplayName("자기 자신을 팔로우 시도하면 FOLLOW_SELF_LIMIT 예외가 발생한다")
    void createFollow_whenSelfFollow_throwsSelfLimit() {
        // when & then : memberA가 자기 자신(id=1)을 팔로우 시도
        BusinessException exception = assertThrows(BusinessException.class,
                () -> followService.createFollow(memberA, 1L));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.FOLLOW_SELF_LIMIT);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("FOLLOW_001");
    }

    @Test
    @DisplayName("이미 팔로우한 멤버를 다시 팔로우 시도하면 FOLLOW_ALREADY_EXIST 예외가 발생한다")
    void createFollow_whenAlreadyFollowing_throwsAlreadyExist() {
        // given : memberA가 memberB를 이미 팔로우 중인 상태
        given(memberRepository.findById(2L)).willReturn(Optional.of(memberB));
        given(followRepository.existsByFromMemberAndToMember(memberA, memberB)).willReturn(true);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> followService.createFollow(memberA, 2L));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.FOLLOW_ALREADY_EXIST);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("FOLLOW_002");
    }

    // --- deleteFollow ---

    @Test
    @DisplayName("팔로우하지 않은 멤버를 언팔로우 시도하면 FOLLOW_NOT_FOUND 예외가 발생한다")
    void deleteFollow_whenNotFollowing_throwsNotFound() {
        // given : memberA가 memberB를 팔로우하지 않은 상태
        given(memberRepository.findById(2L)).willReturn(Optional.of(memberB));
        given(followRepository.existsByFromMemberAndToMember(memberA, memberB)).willReturn(false);

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> followService.deleteFollow(memberA, 2L));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.FOLLOW_NOT_FOUND);
        assertThat(exception.getErrorCode().getCode()).isEqualTo("FOLLOW_003");
    }
}
