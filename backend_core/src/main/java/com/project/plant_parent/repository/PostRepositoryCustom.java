package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


// Querydsl 사용을 위한 인터페이스
public interface PostRepositoryCustom {
    Page<Post> findAllWithPaging(Pageable pageable);
}
