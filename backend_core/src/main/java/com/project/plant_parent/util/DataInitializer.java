package com.project.plant_parent.util;

import com.project.plant_parent.entity.Authority;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Profile;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.PostRepository;
import com.project.plant_parent.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Arrays;
import java.util.List;

@Slf4j
//@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // 신규 더미 유저 생성
        createDummyMembers();


        // 기존 유저들의 프로필 유실 복구 (Migration)
        syncMissingProfiles();


    }

    private void syncMissingProfiles() {
        log.info(">>> [Migration] 프로필 유실 검사 및 복구 시작...");

        List<Member> allMembers = memberRepository.findAll();
        int count = 0;

        for (Member member : allMembers) {
            // [작동 원리] Member 엔티티에 Profile이 연결되어 있지 않은 경우에만 생성
            if (member.getProfile() == null) {
                Profile profile = Profile.builder()
                        .member(member)
                        .bio("반갑습니다! " + member.getUsername() + "님의 정원입니다.")
                        .build();

                // Member에 연결 (Cascade 설정에 의해 함께 저장되거나 직접 저장)
                member.setProfile(profile);
                profileRepository.save(profile);
                count++;
            }
        }

        if (count > 0) {
            log.info(">>> [Migration] 총 {}명의 유저에게 누락된 프로필을 생성했습니다.", count);
        } else {
            log.info(">>> [Migration] 모든 유저가 프로필을 가지고 있습니다.");
        }
    }

    private void createDummyMembers() {
        if (memberRepository.count() > 100) return;

        log.info(">>> 더미 유저 생성 시작...");
        List<String> names = Arrays.asList("James", "Mary", "Robert", "Patricia", "John");
        String encodedPassword = passwordEncoder.encode("1234");

        for (int i = 1; i <= 20; i++) {
            String username = names.get(i % names.size()) + i;
            Member member = Member.builder()
                    .email(username.toLowerCase() + "@test.com")
                    .password(encodedPassword)
                    .username(username)
                    .authority(Authority.ROLE_USER)
                    .build();

            // 생성 시점에 프로필도 함께 생성하여 연결
            Profile profile = Profile.builder()
                    .member(member)
                    .bio("안녕하세요, " + username + "입니다.")
                    .build();

            member.setProfile(profile);
            memberRepository.save(member);
        }
        log.info(">>> 더미 유저 생성 완료.");
    }


}