package com.project.plant_parent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class NotificationService {
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    private static final Long DEFAULT_TIMEOUT = 30L * 60 * 1000; // 30분

    public SseEmitter subscribe(Long memberId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 연결 종료/ 타임 아웃시 메모리에서 제거
        emitter.onCompletion(()->{
            log.info("SSE 연결 종료 : memberId = {}", memberId);
            emitters.remove(memberId);
        });
        emitter.onTimeout(()->{
            log.warn("SSE 연결 타임아웃 : memberId = {}", memberId);
            emitters.remove(memberId);
        });
        emitters.put(memberId, emitter);

        sendToClient(memberId, "SSE 연결 성공. [memberId = ]" + memberId + "]", "connection");
        return emitter;

    }

    // 알림 전용 공용 메서드

    /**
     * @param receiverId 알림을 받을 사람(게시글 작성자, 팔로잉 당사자)
     * @param data 알림 내용 (예: "새 댓글이 달렸습니다.", "새 팔로워가 생겼습니다.")
     * @param eventName 이벤트 종류 (예: "newComment", "newFollower")
     */
    public void notify(Long receiverId, Object data, String eventName) {
        sendToClient(receiverId, data, eventName);
    }

    // 실제 데이터 전송 로직
    public void sendToClient(Long memberId, Object data, String eventName) {
        SseEmitter emitter = emitters.get(memberId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .id(String.valueOf(System.currentTimeMillis())) // 고유 이벤트 ID
                        .name(eventName)
                        .data(data)
                );
            } catch (IOException e) {
                // 전송 중 에러 발생시 연결 해체
                emitters.remove(memberId);
                log.error("알림 전송 실패로 인한 연결 해제 : {} ", memberId);

            }
        }
    }


}
