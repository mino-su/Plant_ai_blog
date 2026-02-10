package com.project.plant_parent.filter;

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
    // api 요청을 보낼때 마다 가장 먼저 실행되는 코드 - Controller 실행 전에 동작

    private final JwtTokenProvider jwtTokenProvider;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {


        String jwt = resolveToken(request); // 요청 헤더에서 Bearer 을 떼고 순수 토큰 추출

        if (StringUtils.hasText(jwt)) {
            if (jwtTokenProvider.validateToken(jwt)) {
                // Redis에서 로그아웃 여부 확인
                String isLogout = redisTemplate.opsForValue().get(jwt);

                if (ObjectUtils.isEmpty(isLogout)) {
                    // 정상 토근일 경우 SecurityContext에 인증 정보 저장
                    Authentication authentication = jwtTokenProvider.getAuthentication(jwt);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info(" >>>[인증 성공] 사용자: {}", authentication.getName());

                } else{
                    // 로그아웃된 토큰의 경우
                    log.info(" >>>[인증 실패] 로그아웃된 토큰입니다.");
                    sendErrorResponse(response, "이미 로그아웃 된 토큰입니다.");
                    return;
                }
            } else {
                log.info(">>>[인증 실패] 만료되거나 유효하지 않은 토큰입니다.");
                sendErrorResponse(response, "인증 세션이 만료되었습니다.");
                return;
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

    // 클라이언트에게 401에러와 메세지를 json 형태로 전달
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        response.setContentType("application/json;charset=UTF-8");

        // Json 응답 바디 작성
        String json = String.format("{\"error\": 401,  \"message\" : \"%s\"}", message);
        response.getWriter().write(json);

    }


}
