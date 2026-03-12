package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import com.project.plant_parent.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import java.util.Set;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Boolean existsByPostAndMember(Post post, Member member);

    void deleteByPostAndMember(Post post, Member member);

    long countPostLikesByPost(Post post);

    @Query("select p.post.id from PostLike p where p.member = :member ")
    Set<Long> findPostIdsByMember(@Param("member")Member currentMember);


}
