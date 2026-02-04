package com.project.plant_parent.repository;

import com.project.plant_parent.entity.PlantDictionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlantDictionaryRepository extends JpaRepository<PlantDictionary, Long> {
    Optional<PlantDictionary> findByLabel(String label);
}
