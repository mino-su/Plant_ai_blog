package com.project.plant_parent.repository;

import com.project.plant_parent.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PostImageRepository extends JpaRepository<PostImage,Long> {

}
