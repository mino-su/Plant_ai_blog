package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    //@Id가 String(key)이므로 findById의 인자는 String


    Optional<RefreshToken> findByKey(String key);

    boolean existsById(String key);
    void deleteById(String key);

}
