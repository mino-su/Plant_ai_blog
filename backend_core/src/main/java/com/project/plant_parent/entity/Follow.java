package com.project.plant_parent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;


@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "follows", uniqueConstraints = {
        @UniqueConstraint(
                name = "UK_FOLLOW_FROM_TO",
                columnNames = {"from_member_id", "to_member_id"}

        )
})
@Entity
@EntityListeners(AuditingEntityListener.class) // 생성시간 자동 기록
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="from_member_id", nullable = false)
    private Member fromMember; // 팔로우를 건 사람

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="to_member_id", nullable = false)
    private Member toMember; // 팔로우를 당한 사람

    @CreatedDate
    private LocalDateTime createdAt;

}
