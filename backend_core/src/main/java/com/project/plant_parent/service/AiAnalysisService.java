package com.project.plant_parent.service;

import com.project.plant_parent.entity.PostImage;
import com.project.plant_parent.entity.dto.AiAnalysisResponseDto;

public interface AiAnalysisService {
    /**
     *  FlaskService를 통해서 ai 분석 label을 받아온 다음
     *  받아온 라벨을 이용해서 DB(도감 테이블)에서 상세 정보 조회
     *  분석 결과와 도감 정보를 합쳐서 최종 응답 DTO 생성후 반환
     **/
    public AiAnalysisResponseDto getFullAnalysis(PostImage postImage);

}
