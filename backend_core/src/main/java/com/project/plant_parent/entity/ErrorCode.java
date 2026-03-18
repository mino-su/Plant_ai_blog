package com.project.plant_parent.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 유저 관련 에러
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_001", "존재하지 않는 사용자입니다."),

    MEMBER_EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_002", "이미 가입된 이메일 주소 입니다."),
    MEMBER_PASSWORD_MISMATCH(HttpStatus.UNAUTHORIZED, "USER_003", "비밀번호가 일치하지 않습니다."),

    AUTH_UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "AUTH_001","인증되지 않은 사용자 입니다."),
    AUTH_FORBIDDEN(HttpStatus.FORBIDDEN,"AUTH_002","해당 작업에 대한 권한이 없습니다."),
    AUTH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "AUTH_003","유효하지 않은 토큰입니다."),
    AUTH_TOKEN_MISMATCH(HttpStatus.UNAUTHORIZED,"AUTH_004","토큰의 정보가 일치하지 않습니다."),
    AUTH_TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "AUTH_005", "토큰 정보가 존재하지 않습니다."),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "AUTH_006", "아이디 또는 비밀번호가 일치하지 않습니다."),


    // 게시글 관련 에러
    POST_NOT_FOUND(HttpStatus.NOT_FOUND,"POST_001","게시글이 존재하지 않습니다."),
    POST_NOT_WRITER(HttpStatus.FORBIDDEN,"POST_002","게시글 작성자만 수정/삭제 할 수 있습니다."),

    // 게시글 좋아요 관련 에러
    POST_LIKE_FORBIDDEN(HttpStatus.FORBIDDEN,"POST_LIKE_001","게시글 작성자 본인은 좋아요를 할 수 없습니다.."),
    POST_LIKE_ALREADY_EXISTS(HttpStatus.CONFLICT,"POST_LIKE_002","이미 좋아요 한 게시글 입니다."),
    POST_LIKE_NOT_FOUND(HttpStatus.NOT_FOUND,"POST_LIKE_003","게시글 좋아요가 존재하지 않습니다."),

    // 이미지 관련 에러
    IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND,"IMAGE_001","존재하지 않는 이미지 입니다."),

    // 댓글 관련 에러
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMENT_001","존재하지 않는 댓글 입니다."),
    COMMENT_NOT_WRITER(HttpStatus.FORBIDDEN,"COMMENT_002","댓글 작성자만 수정/삭제 할 수 있습니다."),
    COMMENT_NOT_MATCHED(HttpStatus.CONFLICT,"COMMENT_003", "부모 댓글과 같은 게시글에만 대댓글을 달 수 있습니다."),

    // AI 서버 관련 에러
    AI_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,"AI_001", "AI 서버와의 통신 중 오류가 발생했습니다."),
    AI_SERVER_CONNECT_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,"AI_002", "AI 서버에 연결할 수 없습니다."),


    //팔로우 관련 에러
    FOLLOW_SELF_LIMIT(HttpStatus.CONFLICT,"FOLLOW_001","자기 자신을 팔로우 할 수 없습니다."),
    FOLLOW_ALREADY_EXIST(HttpStatus.CONFLICT,"FOLLOW_002","이미 팔로우 한 회원 입니다."),
    FOLLOW_NOT_FOUND(HttpStatus.NOT_FOUND,"FOLLOW_003","팔로우가 되어있지 않은 회원입니다."),

    // 검색 관련 에러
    SEARCH_TYPE_NOT_FOUND(HttpStatus.NOT_FOUND, "SEARCH_001","존재하지 않는 검색 타입 입니다."),

    // 알림 관련 에러
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "NOTIFICATION_001","존재하지 않는 알림입니다."),
    NOTIFICATION_UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "NOTIFICATION_002","인증되지 않은 사용자입니다."),

    // 공공 데이터 관련 에러
    PUBLIC_DATA_CONNECT_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "PUBLIC_001","공공데이터를 가져올 수 없습니다."),

    // 공통 에러
    GLOBAL_FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "GLOBAL_001","파일이 존재하지 않습니다."),
    GLOBAL_INVALID_INPUT(HttpStatus.BAD_REQUEST,"GLOBAL_002","잘못된 요청 양식입니다."),
    GLOBAL_INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "GLOBAL_003", "서버 내부 오류가 발생했습니다.");

    private final HttpStatus status; // http 상태 코드
    private final String code; //  에러코드
    private final String message; // 에러 메세지


}
