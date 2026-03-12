package com.project.plant_parent.entity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.plant_parent.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;

    private String receiver;

    private String content;

    private String type;

    private Long targetId;

    private boolean isRead;
    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    public static NotificationDto from(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .receiver(notification.getReceiver().getUsername())
                .content(notification.getContent())
                .type(notification.getType())
                .targetId(notification.getTargetId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }



}
