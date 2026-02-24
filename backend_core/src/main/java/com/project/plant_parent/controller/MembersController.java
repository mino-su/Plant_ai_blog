package com.project.plant_parent.controller;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.dto.*;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.service.FollowService;
import com.project.plant_parent.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MembersController {
    private final FollowService followService;
    private final MyPageService myPageService;

    @PostMapping("/{memberId}/follow")
    public ResponseEntity<FollowResponseDto> createFollow(
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {

        Member currentMember = userDetails.getMember();
        FollowResponseDto follow = followService.createFollow(currentMember, memberId);
        return ResponseEntity.status(HttpStatus.CREATED).body(follow);

    }

    @DeleteMapping("/{memberId}/follow")
    public ResponseEntity<String> deleteFollow(
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Member currentMember = userDetails.getMember();
        followService.deleteFollow(currentMember, memberId);
        return ResponseEntity.ok("팔로우가 취소되었습니다.");
    }

//    @GetMapping("/{memberId}/followers")
//    public ResponseEntity<List<FollowResponseDto>> getFollowers(
//            @PathVariable Long memberId
//    ) {
//        List<FollowResponseDto> followers = followService.getFollowers(memberId);
//        return ResponseEntity.ok(followers);
//    }
//
//    @GetMapping("/{memberId}/followings")
//    public ResponseEntity<List<FollowResponseDto>> getFollowings(
//            @PathVariable Long memberId
//    ) {
//        List<FollowResponseDto> followings = followService.getFollowings(memberId);
//        return ResponseEntity.ok(followings);
//    }

    @GetMapping("/{memberId}/followers")
    public ResponseEntity<List<FollowListResponseDto>> getFollowers(
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
            ) {

        Member currentMember = userDetails.getMember();
        List<FollowListResponseDto> followers = followService.getFollowers(memberId, currentMember);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{memberId}/followings")
    public ResponseEntity<List<FollowListResponseDto>> getFollowings(
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Member currentMember = userDetails.getMember();
        List<FollowListResponseDto> followings = followService.getFollowings(memberId, currentMember);
        return ResponseEntity.ok(followings);
    }

    @GetMapping("/{memberId}/mypage")
    public ResponseEntity<MyPageResponseDto> getMyPageInfo(
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Member currentMember = (userDetails != null) ? userDetails.getMember() : null;
        return ResponseEntity.ok(myPageService.getMyPageInfo(memberId, currentMember));
    }

    @GetMapping("/me")
    public ResponseEntity<MemberIdResponseDto> getMyInfo(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        if (userDetails == null) {
            // 프론트엔드 MyPage.jsx의 catch 문으로 보내기 위해 401을 반환하거나,
            // 혹은 null을 포함한 DTO를 반환해서 "비로그인"임을 알려야 합니다.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Member currentMember =  userDetails.getMember();
        return ResponseEntity.ok(MemberIdResponseDto.from(currentMember.getId()));
    }
}
