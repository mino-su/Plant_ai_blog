package com.project.plant_parent.entity;

import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass // 공동 엔티티 속성 정의
@EntityListeners(AuditingEntityListener.class)
// JPA 엔티티의 이벤트를 감지하고 자동으로 값을 설정하는 리스너, @CreatedDate, @LastModifiedDate 어노테이션이 동작하도록 함
// 엔티티가 생성될때 createdAt이 자동 저장되고 엔티티가 변경될때 @updatedAt이 자동 업데이트됨
public abstract class BaseTimeEntity {
    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime modifiedAt;

}
