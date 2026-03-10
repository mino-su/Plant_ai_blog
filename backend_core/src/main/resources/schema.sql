-- Table Definition
CREATE TABLE "public"."comments" (
                                     "id" int8 NOT NULL,
                                     "created_at" timestamp,
                                     "modified_at" timestamp,
                                     "content" varchar NOT NULL,
                                     "is_deleted" bool NOT NULL,
                                     "member_id" int8,
                                     "parent_id" int8,
                                     "post_id" int8,
                                     CONSTRAINT "fklri30okf66phtcgbe5pok7cc0" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id"),
                                     CONSTRAINT "fkkv22t54g17a6hvj7hbn6byh5s" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id"),
                                     CONSTRAINT "fkbqnvawwwv4gtlctsi3o7vs131" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id"),
                                     PRIMARY KEY ("id")
);
-- Table Definition
CREATE TABLE "public"."disease_dictionary" (
                                               "id" int8 NOT NULL,
                                               "danger_level" varchar CHECK ((danger_level)::text = ANY ((ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying])::text[])),
    "prevention" text,
    "solutions" text,
    "symptoms" text,
    "label" varchar NOT NULL,
    "name_kr" varchar NOT NULL,
    PRIMARY KEY ("id")
);
-- Table Definition
CREATE TABLE "public"."follows" (
                                    "id" int8 NOT NULL,
                                    "created_at" timestamp,
                                    "from_member_id" int8 NOT NULL,
                                    "to_member_id" int8 NOT NULL,
                                    CONSTRAINT "fkcx1obn1hi2phkj64am6ib535u" FOREIGN KEY ("from_member_id") REFERENCES "public"."members"("id"),
                                    CONSTRAINT "fkj5pnll2hbesc985utafw2ty7w" FOREIGN KEY ("to_member_id") REFERENCES "public"."members"("id"),
                                    PRIMARY KEY ("id")
);
-- Table Definition
CREATE TABLE "public"."members" (
                                    "id" int8 NOT NULL,
                                    "created_at" timestamp,
                                    "modified_at" timestamp,
                                    "authority" varchar CHECK ((authority)::text = ANY ((ARRAY['ROLE_ADMIN'::character varying, 'ROLE_USER'::character varying])::text[])),
    "email" varchar NOT NULL,
    "password" varchar NOT NULL,
    "username" varchar,
    PRIMARY KEY ("id")
);
-- Table Definition
CREATE TABLE "public"."notifications" (
                                          "id" int8 NOT NULL,
                                          "content" varchar NOT NULL,
                                          "created_at" timestamp,
                                          "is_read" bool NOT NULL,
                                          "type" varchar NOT NULL,
                                          "receiver_id" int8 NOT NULL,
                                          "modified_at" timestamp,
                                          CONSTRAINT "fkp51madb59uipxbcdmwghbxm15" FOREIGN KEY ("receiver_id") REFERENCES "public"."members"("id"),
                                          PRIMARY KEY ("id")
);
-- Table Definition
CREATE TABLE "public"."plant_dictionary" (
                                             "id" int8 NOT NULL,
                                             "description" text NOT NULL,
                                             "label" varchar NOT NULL,
                                             "name_kr" varchar NOT NULL,
                                             PRIMARY KEY ("id")
);
-- Table Definition
CREATE TABLE "public"."post" (
                                 "id" int8 NOT NULL,
                                 "created_at" timestamp,
                                 "modified_at" timestamp,
                                 "content" text NOT NULL,
                                 "title" varchar NOT NULL,
                                 "member_id" int8,
                                 CONSTRAINT "fk6okhu5mmwauixu447h0fnipql" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id"),
                                 PRIMARY KEY ("id")
);
-- Table Definition
CREATE TABLE "public"."post_images" (
                                        "id" int8 NOT NULL,
                                        "created_at" timestamp,
                                        "modified_at" timestamp,
                                        "confidence" float8,
                                        "disease" varchar,
                                        "image_url" varchar,
                                        "original_file_name" varchar,
                                        "plant" varchar,
                                        "post_id" int8,
                                        CONSTRAINT "fk4436mqgshkhub17yvq5ku91f7" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id"),
                                        PRIMARY KEY ("id")
);
-- Table Definition