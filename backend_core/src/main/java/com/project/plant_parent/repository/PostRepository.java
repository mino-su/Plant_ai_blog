package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post,Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    Optional<Post> findPostById(Long postId);


    @Query(
            "select distinct p from Post p " +
                    "left join fetch p.postImages "+
                    "join fetch p.member " +
                    "where p.member = :member "+
                    "order by p.createdAt desc"
    )
    List<Post> findAllByMemberOrderByCreatedAtDesc(@Param("member")Member member);


}
