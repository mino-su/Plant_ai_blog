package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.QMember;
import com.project.plant_parent.entity.QPost;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

// Querydsl 구현체
@RequiredArgsConstructor
public class PostRepositoryCustomImpl implements PostRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Post> findAllWithPaging(Pageable pageable){
        QPost post = QPost.post;
        QMember member = QMember.member;

        // 1. 실제 데이터 가져오기
        List<Post> content = queryFactory
                .selectFrom(post)
                .join(post.member, member).fetchJoin()
                .orderBy(post.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // 2. 전체 개수 세기
        Long total = queryFactory
                .select(post.count())
                .from(post)
                .fetchOne();

        // 결과 합쳐서 PageImpl 반환
        return new PageImpl<>(content, pageable, total);

    }

}
