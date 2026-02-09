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
public interface PostRepository extends JpaRepository<Post,Long>, PostRepositoryCustom {

//    List<Post> findAllByOrderByCreatedAtDesc(); // QueryDsl로 페이징 까지 구현했으므로 안씀

    // 단순 조회
    Optional<Post> findPostById(Long postId);

    // 상세 페이지용
    @Query("select p from Post p "+
            "join fetch p.member " +
            "left join fetch p.postImages " +
            "where p.id = :postId"
    )
    Optional<Post> findPostWithDetailsById(@Param("postId") Long postId);


    @Query(
            "select distinct p from Post p " +
                    "left join fetch p.postImages "+
                    "join fetch p.member " +
                    "where p.member = :member "+
                    "order by p.createdAt desc"
    )
    List<Post> findAllByMemberOrderByCreatedAtDesc(@Param("member")Member member);


}
