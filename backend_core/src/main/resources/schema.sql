
-- =========================================================================
--  테이블 생성
-- =========================================================================

-- 1. 회원 (Members)
CREATE TABLE "public"."members" (
                                    "id" BIGSERIAL PRIMARY KEY,
                                    "created_at" timestamp,
                                    "modified_at" timestamp,
                                    "authority" varchar(50) CHECK ("authority" IN ('ROLE_ADMIN', 'ROLE_USER')),
                                    "email" varchar(255) NOT NULL UNIQUE, -- 이메일 중복 가입 방지
                                    "password" varchar(255) NOT NULL,
                                    "username" varchar(255)
);

-- 2. 프로필 (Profile) - Member와 1:1 관계 (id 공유)
CREATE TABLE "public"."profile" (
                                    "member_id" int8 NOT NULL PRIMARY KEY, -- Member의 ID를 그대로 사용 (@MapsId)
                                    "bio" text,
                                    "profile_image_url" varchar(255),
                                    "website_url" varchar(255),
                                    CONSTRAINT "fk_profile_member" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id")
);

-- 3. 식물 도감 (Plant Dictionary)
CREATE TABLE "public"."plant_dictionary" (
                                             "id" BIGSERIAL PRIMARY KEY,
                                             "label" varchar(100) NOT NULL UNIQUE, -- AI 라벨 중복 저장 방지
                                             "name_kr" varchar(100) NOT NULL,
                                             "description" text NOT NULL
);

-- 4. 병해 도감 (Disease Dictionary)
CREATE TABLE "public"."disease_dictionary" (
                                               "id" BIGSERIAL PRIMARY KEY,
                                               "label" varchar(100) NOT NULL UNIQUE, -- AI 라벨 중복 저장 방지
                                               "name_kr" varchar(100) NOT NULL,
                                               "symptoms" text,
                                               "solutions" text,
                                               "prevention" text,
                                               "danger_level" varchar(20) CHECK ("danger_level" IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- 5. 팔로우 (Follows)
CREATE TABLE "public"."follows" (
                                    "id" BIGSERIAL PRIMARY KEY,
                                    "from_member_id" int8 NOT NULL,
                                    "to_member_id" int8 NOT NULL,
                                    "created_at" timestamp,
                                    CONSTRAINT "fk_follow_from" FOREIGN KEY ("from_member_id") REFERENCES "public"."members"("id"),
                                    CONSTRAINT "fk_follow_to" FOREIGN KEY ("to_member_id") REFERENCES "public"."members"("id"),
    -- [동시성 방어] A가 B를 두 번 팔로우하는 것을 DB 레벨에서 완벽 차단
                                    CONSTRAINT "uk_follow_from_to" UNIQUE ("from_member_id", "to_member_id")
);

-- 6. 알림 (Notifications)
CREATE TABLE "public"."notifications" (
                                          "id" BIGSERIAL PRIMARY KEY,
                                          "receiver_id" int8 NOT NULL,
                                          "content" varchar(255) NOT NULL,
                                          "type" varchar(50) NOT NULL,
                                          "is_read" bool NOT NULL DEFAULT false,
                                          "created_at" timestamp,
                                          "modified_at" timestamp,
                                          CONSTRAINT "fk_notification_receiver" FOREIGN KEY ("receiver_id") REFERENCES "public"."members"("id")
);

-- 7. 게시글 (Post)
CREATE TABLE "public"."post" (
                                 "id" BIGSERIAL PRIMARY KEY,
                                 "member_id" int8,
                                 "title" varchar(255) NOT NULL,
                                 "content" text NOT NULL, -- JSON 데이터를 담기 위해 넓은 text 사용
                                 "created_at" timestamp,
                                 "modified_at" timestamp,
                                 CONSTRAINT "fk_post_member" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id")
);

-- 8. 게시글 이미지 (Post Images)
CREATE TABLE "public"."post_images" (
                                        "id" BIGSERIAL PRIMARY KEY,
                                        "post_id" int8,
                                        "image_url" varchar(500),
                                        "original_file_name" varchar(255),
                                        "plant" varchar(100),
                                        "disease" varchar(100),
                                        "confidence" float8,
                                        "created_at" timestamp,
                                        "modified_at" timestamp,
                                        CONSTRAINT "fk_post_images_post" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id")
);

-- 9. 게시글 좋아요 (Post Like)
CREATE TABLE "public"."post_like" (
                                      "id" BIGSERIAL PRIMARY KEY,
                                      "member_id" int8 NOT NULL,
                                      "post_id" int8 NOT NULL,
                                      "created_at" timestamp,
                                      "modified_at" timestamp,
                                      CONSTRAINT "fk_like_member" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id"),
                                      CONSTRAINT "fk_like_post" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id"),
    -- [동시성 방어] 한 유저가 한 글에 좋아요를 연타해도 DB에서 하나만 저장되도록 차단
                                      CONSTRAINT "uk_post_like_member_post" UNIQUE ("member_id", "post_id")
);

-- 10. 댓글 및 대댓글 (Comments)
CREATE TABLE "public"."comments" (
                                     "id" BIGSERIAL PRIMARY KEY,
                                     "post_id" int8,
                                     "member_id" int8,
                                     "parent_id" int8, -- 대댓글 구조를 위한 자기 참조
                                     "content" text NOT NULL,
                                     "is_deleted" bool NOT NULL DEFAULT false,
                                     "created_at" timestamp,
                                     "modified_at" timestamp,
                                     CONSTRAINT "fk_comment_post" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id"),
                                     CONSTRAINT "fk_comment_member" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id"),
                                     CONSTRAINT "fk_comment_parent" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id")
);