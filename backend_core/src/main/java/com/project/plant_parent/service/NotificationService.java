package com.project.plant_parent.service;

import com.project.plant_parent.entity.ErrorCode;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Notification;
import com.project.plant_parent.entity.dto.NotificationDto;
import com.project.plant_parent.exception.BusinessException;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final MemberRepository memberRepository;
    private final NotificationRepository notificationRepository;

    private static final Long DEFAULT_TIMEOUT = 30L * 60 * 1000; // 30분

    public SseEmitter subscribe(Long memberId) {
        String emitterId = memberId + "_" + System.currentTimeMillis();
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 연결 종료/ 타임 아웃시 메모리에서 제거
        emitter.onCompletion(() -> {
            log.info("SSE 연결 종료 : memberId = {}", emitterId);
            emitters.remove(emitterId);
        });
        emitter.onTimeout(() -> {
            log.warn("SSE 연결 타임아웃 : memberId = {}", emitterId);
            emitters.remove(emitterId);
        });
        emitters.put(emitterId, emitter);

        sendToClient(emitterId, "SSE 연결 성공. [memberId = ]" + memberId + "]", "connection");
        return emitter;

    }

    // 알림 전용 공용 메서드

    /**
     * @param receiverId 알림을 받을 사람(게시글 작성자, 팔로잉 당사자)
     * @param content    알림 내용 (예: "새 댓글이 달렸습니다.", "새 팔로워가 생겼습니다.")
     * @param eventName  이벤트 종류 (예: "newComment", "newFollower")
     */
    @Transactional // 트랜잭션 추가
    public void notify(Long receiverId, String content, String eventName, Long targetId) {
        Member receiver = memberRepository.findById(receiverId).orElseThrow(
                () -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND)
        );

        Notification notification = Notification.builder()
                .receiver(receiver)
                .content(content)
                .type(eventName)
                .targetId(targetId)
                .isRead(false)
                .build();

        notificationRepository.save(notification);

        // DB 저장이 성공한 후, 해당 사용자의 '모든' 활성 Emitter에 메시지 전송
        sendToReceiver(receiverId, content, eventName);
        log.info(">>> 알림 전송 완료 : {} -> {} ", receiverId, eventName);
    }

    // 특정 사용자의 '모든' Emitter를 찾아 전송하는 메서드
    private void sendToReceiver(Long memberId, Object data, String eventName) {
        // memberId로 시작하는 모든 Emitter를 찾아서 전송
        emitters.forEach((emitterId, emitter) -> {
            if (emitterId.startsWith(memberId + "_")) {
                sendToClient(emitterId, data, eventName);
            }
        });
    }

    // 단일 Emitter에 전송하는 메서드 (내부용)
    private void sendToClient(String emitterId, Object data, String eventName) {
        SseEmitter emitter = emitters.get(emitterId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .id(String.valueOf(System.currentTimeMillis()))
                        .name(eventName)
                        .data(data)
                );
            } catch (IOException e) {
                emitters.remove(emitterId);
                log.error("알림 전송 실패로 인한 연결 해제 : {} ", emitterId);
            }
        }
    }


    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(Member member) {
        List<Notification> NotificationList = notificationRepository.findAllByReceiverOrderByCreatedAtDesc(member);
        return NotificationList.stream()
                .map(NotificationDto::from)
                .collect(Collectors.toList());

    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsNotRead(Member member) {
        List<Notification> NotificationList = notificationRepository.findAllByReceiverAndIsReadFalseOrderByCreatedAtDesc(member);
        return NotificationList.stream()
                .map(NotificationDto::from)
                .collect(Collectors.toList());

    }

    @Transactional
    public void readNotification(Long notificationId, Long memberId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // 보안 검증: 본인의 알림만 읽음 처리 가능
        if (!notification.getReceiver().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.NOTIFICATION_UNAUTHORIZED);
        }

        notification.markAsRead(); // 엔티티의 메서드 호출
    }


}
