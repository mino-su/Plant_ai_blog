package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post,Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    Optional<Post> findPostById(Long postId);
}
