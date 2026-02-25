package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Boolean existsByPostAndMember(Post post, Member member);

    void deleteByPostAndMember(Post post, Member member);

    long countPostLikesByPost(Post post);
}
