package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Category;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.dto.PostSearchConditionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


// Querydsl 사용을 위한 인터페이스
public interface PostRepositoryCustom {
    Page<Post> findAllWithPaging(Pageable pageable); // 페이징

    Page<Post> findAllOrderByPostLikesDescWithPaging(Pageable pageable);

    Page<Post> search(PostSearchConditionDto postSearchConditionDto, Pageable pageable);

    Page<Post> findAllByCategoryWithPaging(String category, Pageable pageable);

    Page<Post> findAllByCategoryOrderByPostLikesDescWithPaging(String category, Pageable pageable);
}
