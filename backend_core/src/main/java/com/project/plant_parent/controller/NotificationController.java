package com.project.plant_parent.controller;

import com.project.plant_parent.entity.Notification;
import com.project.plant_parent.entity.dto.NotificationDto;
import com.project.plant_parent.security.UserDetailsImpl;
import com.project.plant_parent.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> subscribe(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        // 로그인 정보가 없으면 구독 불가능
        if (userDetails == null) {
            return null;
        }
        SseEmitter emitter = notificationService.subscribe(userDetails.getMember().getId());
        return ResponseEntity.ok()
                .header("X-Accel-Buffering", "no") // Nginx 버퍼링 방지
                .header("Cache-Control", "no-cache") // 브라우저 캐시 방지
                .body(emitter);
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // 인증되지 않은 사용자
        }
        List<NotificationDto> notifications = notificationService.getNotifications(userDetails.getMember());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/notread")
    public ResponseEntity<List<NotificationDto>> getNotificationsNotRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // 인증되지 않은 사용자
        }
        List<NotificationDto> notifications = notificationService.getNotificationsNotRead(userDetails.getMember());
        return ResponseEntity.ok(notifications);
    }

    // 특정 알림 읽음 처리
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> readNotification(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        notificationService.readNotification(notificationId, userDetails.getMember().getId());
        return ResponseEntity.ok().build();
    }
}
