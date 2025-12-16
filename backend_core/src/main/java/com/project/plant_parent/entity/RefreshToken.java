package com.project.plant_parent.entity;


import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDateTime;

@RedisHash(value="refreshToken", timeToLive=1209600) // TTL 2주 설정
@Getter
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    private String key; // Key: 사용자 ID(email or primaryKey)

    private String value; // Value: Refresh Token String

    public void updateToken(String token) {
        this.value = token;
    }

}
