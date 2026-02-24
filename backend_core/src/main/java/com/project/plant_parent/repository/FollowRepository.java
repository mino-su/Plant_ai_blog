package com.project.plant_parent.repository;

import com.project.plant_parent.entity.Follow;
import com.project.plant_parent.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    // 팔로우 여부 확인
    // select count(*) from follows where from_member_id = ? and to_member_id = ?
    boolean existsByFromMemberAndToMember(Member fromMember, Member toMember);
    // 언팔로우(삭제)
    // delete from follows where from_member_id = ? and to_member_id = ?
    void deleteByFromMemberAndToMember(Member fromMember, Member toMember);




    // 팔로잉 목록 조회 (사용자가 팔로우 한 사람들)
    // select * from follows where from_member_id = ?
    //    List<Follow> findAllByFromMember(Member fromMember); -> N+1 문제 발생
    @Query("select f from Follow f join fetch f.toMember where f.fromMember = :member")
    List<Follow> findAllByFromMember(@Param("member") Member fromMember);


    // 팔로워 목록 조회(사용자를 팔로우 한 사람들)
    // select * from follows where to_member_id = ?
    //   List<Follow> findAllByToMember(Member toMember); -> N+1 문제 발생
    @Query("select f from Follow f join fetch f.fromMember where f.toMember= :member")
    List<Follow> findAllByToMember(@Param("member") Member toMember);

    // 카운트 조회(마이페이지 숫자 표시)

    // 팔로잉 수
    // select count(*) from follows where from_member_id = ?
    long countByFromMember(Member fromMember);

    // 팔로워 수
    // select count(*) from follows where to_member_id = ?
    long countByToMember(Member toMember);

   // 팔로잉(사용자가 화살표를 보낸 사람) 대상들의 ID만 뽑아냄
    @Query("select f.toMember.id from Follow f where f.fromMember = :member")
    Set<Long> findAllToMemberIdsByFromMember(@Param("member") Member fromMember);




}
