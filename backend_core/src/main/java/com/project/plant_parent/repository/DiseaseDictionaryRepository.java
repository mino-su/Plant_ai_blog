package com.project.plant_parent.repository;

import com.project.plant_parent.entity.DiseaseDictionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiseaseDictionaryRepository extends JpaRepository<DiseaseDictionary, Long> {
    Optional<DiseaseDictionary> findByLabel(String label);
}
