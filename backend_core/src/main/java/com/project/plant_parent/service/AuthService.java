package com.project.plant_parent.service;

import com.project.plant_parent.config.JwtTokenProvider;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.RefreshToken;
import com.project.plant_parent.entity.dto.*;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RedisTemplate<String, String> redisTemplate;


    @Transactional
    public MemberResponseDto signup(MemberRequestDto memberRequestDto) {

        if (memberRepository.existsByEmail(memberRequestDto.getEmail())) {
            throw new RuntimeException("이미 사용중인 이메일입니다.");
        }
        Member member = memberRequestDto.toMember(passwordEncoder);
        Member savedMember = memberRepository.saveAndFlush(member);


        // [★ 디버깅 코드 추가]
        System.out.println("=========================================");
        System.out.println(">>> 저장 성공 여부 확인");
        System.out.println(">>> 저장된 ID: " + savedMember.getId());
        System.out.println(">>> 저장된 Email: " + savedMember.getEmail());
        System.out.println("=========================================");

        return MemberResponseDto.of(savedMember);
    }

    @Transactional
    public TokenDto login(LoginRequestDto loginRequestDto) {
        // 1. login ID/PW 를 기반으로 AuthenticationToken 생성
        UsernamePasswordAuthenticationToken authenticationToken = loginRequestDto.toAuthentication();
        // 2. 실제로 검증 (사용자 비밀번호 체크) 이 이루어지는 부분
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        // 3. 인증 정보를 기반으로 JWT 토큰 생성
        TokenDto tokenDto = jwtTokenProvider.generateToken(authentication);
        // 4. RefreshToken 저장
       RefreshToken refreshToken = RefreshToken.builder()
               .key(authentication.getName())
               .value(tokenDto.getRefreshToken())
               .build();
        refreshTokenRepository.save(refreshToken);
        return tokenDto;
    }

    @Transactional
    public TokenDto reissue(TokenRequestDto tokenRequestDto) {
        // 1. Refresh Token 검증
        if (!jwtTokenProvider.validateToken(tokenRequestDto.getRefreshToken())) {
            throw new RuntimeException("Refresh Token 이 유효하지 않습니다.");
        }
        // 2. Access Token 에서 Member Email 가져오기
        Authentication authentication = jwtTokenProvider.getAuthentication(tokenRequestDto.getAccessToken());

        // 3. Authentication 에서 email 가져오기
        RefreshToken refreshToken = refreshTokenRepository.findById(authentication.getName())
                .orElseThrow(() -> new RuntimeException("로그아웃 된 사용자입니다."));
        // 4. Refresh Token 일치하는지 검사
        if (!refreshToken.getValue().equals(tokenRequestDto.getRefreshToken())) {
            throw new RuntimeException("토큰의 유저 정보가 일치하지 않습니다.");
        }
        // 5. 새로운 토큰 생성
        TokenDto tokenDto = jwtTokenProvider.generateToken(authentication);
        // 6. Redis 정보 업데이트
        refreshToken.updateToken(tokenDto.getRefreshToken());
        refreshTokenRepository.save(refreshToken);

        return tokenDto;
    }

    @Transactional
    public void logout(String accessToken) {
        // 1. accessToken에서 authentication 정보 가져오기
        Authentication authentication = jwtTokenProvider.getAuthentication(accessToken);
        // 2. refreshRepository에서 refreshToken 삭제
        if(refreshTokenRepository.existsById(authentication.getName())){
            refreshTokenRepository.deleteById(authentication.getName());

        }
        // 3. AccessToken BlackList 처리
        Long expiration = jwtTokenProvider.getExpiration(accessToken);

        // (Key: 토큰 값, value: logout, TTL: 남은시간)
        // 토큰이 만료 될때까지만 저장
        redisTemplate.opsForValue()
                .set(accessToken, "logout", expiration, TimeUnit.MILLISECONDS);


    }
}
