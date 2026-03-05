package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Member;
import com.project.plant_parent.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n JOIN FETCH n.receiver WHERE n.receiver = :receiver ORDER BY n.createdAt DESC")
    List<Notification> findAllByReceiverOrderByCreatedAtDesc(@Param("receiver") Member receiver);

    @Query("SELECT n FROM Notification n JOIN FETCH n.receiver WHERE n.receiver = :receiver AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findAllByReceiverAndIsReadFalseOrderByCreatedAtDesc(@Param("receiver") Member receiver);
}

