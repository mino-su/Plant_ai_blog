package com.project.plant_parent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.beans.factory.annotation.Value;

@Builder
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table
public class Profile {
    @Id
    private Long id;

    @MapsId // Member의 Pk 값을 이 엔티티의 PK로 그대로 사용
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="member_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Member member;


    private String bio;

    private String profileImageUrl = null;

    private String websiteUrl;

    @Builder
    public Profile(Member member, String bio, String profileImageUrl,String websiteUrl) {
        this.member = member;

        this.bio = bio;

        this.profileImageUrl = profileImageUrl;

        this.websiteUrl = websiteUrl;
    }

    public void updateProfile(String bio, String profileImageUrl, String websiteUrl) {
        this.bio = bio;
        this.profileImageUrl = profileImageUrl;
        this.websiteUrl = websiteUrl;
    }



}
