package com.project.plant_parent.controller;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.dto.FollowResponseDto;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class FollowController {
    private final FollowService followService;

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

    @GetMapping("/{memberId}/followers")
    public ResponseEntity<List<FollowResponseDto>> getFollowers(
            @PathVariable Long memberId
    ) {
        List<FollowResponseDto> followers = followService.getFollowers(memberId);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{memberId}/followings")
    public ResponseEntity<List<FollowResponseDto>> getFollowings(
            @PathVariable Long memberId
    ) {
        List<FollowResponseDto> followings = followService.getFollowings(memberId);
        return ResponseEntity.ok(followings);
    }
}
