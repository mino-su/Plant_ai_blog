package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Profile;
import jakarta.websocket.server.PathParam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile,Long> {

    @Query("select p from Profile p " +
            "join fetch p.member " +
            "where p.id = :memberId")
    Optional<Profile> findProfileById(@Param("memberId") Long memberId);
}
