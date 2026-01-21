package com.project.plant_parent.util;

import com.project.plant_parent.entity.Authority;
import com.project.plant_parent.entity.Member;
import com.project.plant_parent.repository.MemberRepository;
import com.project.plant_parent.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Arrays;
import java.util.List;

//@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final MemberRepository memberRepository;
    private final PostRepository postRepository; // [추가] 게시글 상태 확인용
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // 1. 현재 어떤 DB 파일에 접속 중인지 로그로 박멸합니다.
        try (Connection connection = dataSource.getConnection()) {
            String url = connection.getMetaData().getURL();
            System.out.println("==========================================");
            System.out.println(">>> [연결 성공] 접속 주소: " + url);
            System.out.println(">>> [연결 성공] 접속 유저: " + connection.getMetaData().getUserName());
            System.out.println("==========================================");
        }

        long memberCount = memberRepository.count();
        long postCount = postRepository.count(); // [추가]

        System.out.println(">>> [현황 보고] 현재 DB 내 Member 수: " + memberCount);
        System.out.println(">>> [현황 보고] 현재 DB 내 Post 수: " + postCount);

        // Member가 하나라도 있으면 초기 생성을 건너뜁니다.
        if (memberCount > 2) {
            System.out.println(">>> 이미 유저 데이터가 존재합니다. 생성을 중단합니다.");
            return;
        }

        System.out.println(">>> 영어 이름 기반 100명 더미 유저 생성 시작...");

        List<String> names = Arrays.asList(
                "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
                "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph",
                "Jessica", "Thomas", "Sarah", "Charles", "Karen"
        );

        String encodedPassword = passwordEncoder.encode("1234");

        for (int i = 1; i <= 100; i++) {
            String baseName = names.get(i % names.size());
            String username = baseName + i;
            String email = username.toLowerCase() + "@test.com";

            Member member = Member.builder()
                    .email(email)
                    .password(encodedPassword)
                    .username(username)
                    .authority(Authority.ROLE_USER)
                    .build();

            memberRepository.save(member);
        }

        System.out.println(">>> 100명의 더미 유저 생성이 완료되었습니다.");
    }
}