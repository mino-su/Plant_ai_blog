package com.project.plant_parent.config.filter;

import com.project.plant_parent.config.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // api 요청을 보낼때 마다 가장 먼저 실행되는 코드 - Controller 실행 전에 동작

    private final JwtTokenProvider jwtTokenProvider;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {


        String jwt = resolveToken(request); // 요청 헤더에서 Bearer 을 떼고 순수 토큰 추출

        // 토큰 유효 확인
        if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
            // Redis에서 해당 토큰이 blackList된 상태인지 확인
            String isLogout = redisTemplate.opsForValue().get(jwt);
            if (ObjectUtils.isEmpty(isLogout)) {
                // blackList에 없으면 정상적인 인증 수행
                Authentication authentication = jwtTokenProvider.getAuthentication(jwt);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else{
                log.info("로그아웃된 토큰입니다.");
            }
        }

        // 다음 단계로 넘기기
        filterChain.doFilter(request, response);


    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(7);
        }
        return null;
    }


}
