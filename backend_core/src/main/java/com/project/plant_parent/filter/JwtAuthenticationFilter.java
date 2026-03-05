package com.project.plant_parent.filter;

import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.util.JwtTokenProvider;
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

    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 토큰 추출 (헤더 우선, SSE 경로일 경우 파라미터 확인)
        String jwt = resolveToken(request);

        if (StringUtils.hasText(jwt)) {
            // 2. 토큰 서명 및 만료 시간 검증
            if (jwtTokenProvider.validateToken(jwt)) {

                // Redis에서 로그아웃된 토큰인지 확인
                // AuthService.logout 시 저장한 'accessToken' 키와 동일한지 확인
                String isLogout = redisTemplate.opsForValue().get(jwt);

                if (ObjectUtils.isEmpty(isLogout)) {
                    // 3. 정상 토큰일 경우 인증 객체 생성 및 Context 저장
                    Authentication authentication = jwtTokenProvider.getAuthentication(jwt);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug(">>> [인증 성공] 사용자: {}", authentication.getName());
                } else {
                    // 블랙리스트에 등록된 토큰 (이미 로그아웃됨)
                    log.warn(">>> [인증 실패] 로그아웃된 토큰 사용 시도: {}", jwt);
                    sendErrorResponse(response, ErrorCode.AUTH_TOKEN_INVALID, "이미 로그아웃된 세션입니다.");
                    return; // 필터 체인 중단
                }
            } else {
                // 토큰 검증 실패 (변조되거나 만료됨)
                log.info(">>> [인증 실패] 유효하지 않은 토큰입니다.");
                sendErrorResponse(response, ErrorCode.AUTH_TOKEN_INVALID, "인증 정보가 유효하지 않거나 만료되었습니다.");
                return; // 필터 체인 중단
            }
        }

        // 토큰이 없거나(비로그인 가능 경로), 인증이 완료된 경우 다음 필터로 진행
        filterChain.doFilter(request, response);
    }


    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(7);
        }

        // SSE 전용 토큰 추출 (보안을 위해 특정 경로로 한정)
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/api/notifications/subscribe")) {
            String tokenParam = request.getParameter("token");
            if (StringUtils.hasText(tokenParam)) {
                return tokenParam;
            }
        }
        return null;
    }


    private void sendErrorResponse(HttpServletResponse response, ErrorCode errorCode, String detailMessage) throws IOException {
        response.setStatus(errorCode.getStatus().value());
        response.setContentType("application/json;charset=UTF-8");

        // 프로젝트 공통 에러 포맷에 맞춤
        String json = String.format(
                "{\"status\": %d, \"code\": \"%s\", \"message\": \"%s\"}",
                errorCode.getStatus().value(),
                errorCode.getCode(),
                detailMessage
        );

        response.getWriter().write(json);
    }
}