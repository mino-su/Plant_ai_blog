package com.project.plant_parent.repository;

import com.project.plant_parent.entity.*;
import com.project.plant_parent.entity.dto.PostSearchConditionDto;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.ArrayList;
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
        JPAQuery<Long> total = queryFactory
                .select(post.count())
                .from(post);

        // PageableExecutionUtils 사용하여 Page 반환 (count 쿼리는 content 사이즈가 limit보다 작을 때 생략)
        return PageableExecutionUtils.getPage(content, pageable, total::fetchOne);

    }

    @Override
    public Page<Post> findAllOrderByPostLikesDescWithPaging(Pageable pageable) {
        QPost post = QPost.post;
        QMember member = QMember.member;

        // 1. 실제 데이터 가져오기
        List<Post> content = queryFactory.selectFrom(post)
                .join(post.member, member).fetchJoin()
                .orderBy(post.likeCount.desc(),post.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // 2. 전체 개수 세기
        JPAQuery<Long> total = queryFactory
                .select(post.count())
                .from(post);


        // PageableExecutionUtils 사용하여 Page 반환 (count 쿼리는 content 사이즈가 limit보다 작을 때 생략)
        return PageableExecutionUtils.getPage(content, pageable, total::fetchOne);
    }

    @Override
    public Page<Post> search(PostSearchConditionDto postSearchConditionDto, Pageable pageable) {
        QPost post = QPost.post;
        QMember member = QMember.member;
        QPostImage postImage = QPostImage.postImage;

        QPlantDictionary plantDictionary = QPlantDictionary.plantDictionary;
        QDiseaseDictionary diseaseDictionary = QDiseaseDictionary.diseaseDictionary;

        String type = postSearchConditionDto.getType(); // title, writer, content, plant, disease, all
        String keyword = postSearchConditionDto.getKeyword();

        List<Post> content = queryFactory
                .selectFrom(post).distinct()
                .join(post.member, member).fetchJoin()
                .leftJoin(post.postImages, postImage)
                .leftJoin(plantDictionary).on(postImage.plant.eq(plantDictionary.label))
                .leftJoin(diseaseDictionary).on(postImage.disease.eq(diseaseDictionary.label))
                .where(
                        allSearchCond(type, keyword, plantDictionary, diseaseDictionary)
                )
                .orderBy(post.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(post.countDistinct())
                .from(post)
                .join(post.member, member)
                .leftJoin(post.postImages, postImage)
                .leftJoin(plantDictionary).on(postImage.plant.eq(plantDictionary.label))
                .leftJoin(diseaseDictionary).on(postImage.disease.eq(diseaseDictionary.label))
                .where(
                        allSearchCond(type, keyword,plantDictionary,diseaseDictionary)
                )
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null  ? total : 0L);


    }

    // type에 따라 적절한 Boolean Expression 반환
    private BooleanExpression allSearchCond(String type, String keyword,
                                            QPlantDictionary plantDict, QDiseaseDictionary diseaseDict) {
        // 검색어가 없으면 조건을 아예 걸지 않음
        if(!StringUtils.hasText(keyword)) return null;

        if("title".equals(type)) return postTitleContains(keyword);
        if("writer".equals(type)) return writerNameContains(keyword);
        if("content".equals(type)) return contentContains(keyword);
        if("plant".equals(type)) return plantNameContains(keyword, plantDict);
        if("disease".equals(type)) return diseaseNameContains(keyword,diseaseDict);

        if("all".equals(type)){
            return postTitleContains(keyword)
                    .or(writerNameContains(keyword))
                    .or(contentContains(keyword))
                    .or(plantNameContains(keyword, plantDict))
                    .or(diseaseNameContains(keyword, diseaseDict));
        }

        return null;
    }

    private BooleanExpression postTitleContains(String keyword) {
        return QPost.post.title.containsIgnoreCase(keyword);
    }

    private BooleanExpression writerNameContains(String keyword) {
        return QPost.post.member.username.containsIgnoreCase(keyword);
    }

    private BooleanExpression contentContains(String keyword) {
        return QPost.post.content.containsIgnoreCase(keyword);
    }

    private BooleanExpression plantNameContains(String keyword, QPlantDictionary plantDict) {
        return QPostImage.postImage.plant.containsIgnoreCase(keyword)
                .or(plantDict.nameKr.contains(keyword));
    }

    private BooleanExpression diseaseNameContains(String keyword, QDiseaseDictionary diseaseDict) {
        return QPostImage.postImage.disease.containsIgnoreCase(keyword)
                .or(diseaseDict.nameKr.contains(keyword));
    }
}
