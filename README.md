# 🪴 Tree With Me #

<h2> 📱 프로젝트 소개 </h2>
<h4> 🏷️ 프로젝트 명 : 트리 윗 미 </h4>
<h4> 🗓️ 프로젝트 기간 : 2025.12.18 ~ 2026.03.27 </h4>
<h4> 👤 구성원 : 개인프로젝트 </h4>

--------------------------------------------------
## 서비스 구경 바로가기 ##
<h4> 🖥️ 서비스 주소: https://www.treewithme.site </h4>

---------------------------------------------------
<h2> ✅ 서비스 소개 </h2>

**AI 모델을 활용한 식물 종류 판별 및 병해 진단 커뮤니티 플랫폼**
- 사진 한 장으로 식물의 종류, 병해를 진단 할 수 있습니다.
- 커뮤니티와 SNS 기능을 통해 사람들과 소통 할 수 있습니다.
- 식물 도감을 통해서 원하는 정보를 얻을 수 있습니다.

--------------------------------------------------
<h2> 👥 서비스 대상</h2>

- 키우는 식물의 종류와 질병을 확인하고 싶은 초보 식물 집사들
- 식물을 키우는 사람들과 소통하고 싶은 사람들

------------------------------------------------

<h2> 💌 서비스 화면 및 기능 소개 </h2>

### ✅ 메인 페이지 화면 ###

### ✅ 게시판 상세 화면 ###


### ✅ 마이 페이지 화면 ###

### ✅ 식물 도감 화면 ###

## 📜  프로젝트 산출물 ##

### 시스템 아키텍처 ###

<img width="1305" height="752" alt="시스템아키텍처_최종" src="https://github.com/user-attachments/assets/b1273ff1-cc68-4640-91ef-9c9ffeaff492" />

### ERD ###
<img width="1398" height="1195" alt="ERD_TreeWithMe" src="https://github.com/user-attachments/assets/7ed00dfa-5933-4338-8910-b264481358b5" />



## ⚒️ Tech Stack ##
### 🔵 BackEnd & DB
-  JAVA 17 / Spring Boot 3.x
-  Spring Data JPA : Hibernate 기반 데이터 영속성 관리 및 Fetch Join을 통한 성능 최적화
-  Spring Security & JWT : Stateless 인증 체계 구축
-  Redis : JWT 블랙리스트 관리를 통한 보안 강화
-  PostgreSQL 15

### 🟣 AI/ ML Inference
- Python / Flask : 경량 추론 서버 운영
- YOLO v8/v11 : 식물 종류 및 병해 실시간 객체 탐지 모델 탑재

### 🟢 Frontend
 - React 19 / vite : 컴포넌트 기반 UI 설계
 - Editor.js : 블록형 에디터를 통한 구조화된 콘텐츠 관리 및 이미지/글 자유 배치
 - Axios : 인터셉터를 활용한 JWT 자동 인증 및 전역 에러 핸들링

## 🌟 Key Features

### 🧩 블록 기반 게시글 에디터

단순 텍스트 방식을 탈피하여 글-사진-글 순서의 자유로운 배치를 지원합니다.

이미지 선행 업로드(Pre-upload) 방식을 통해 서버 자원을 효율적으로 관리합니다.

### 🔍 AI 식물 진단 & 도감 연동

업로드된 이미지를 분석하여 식물명과 병해명을 도출합니다.

도감 시스템(Dictionary): 단순 분석 결과를 넘어 DB에 저장된 증상, 해결책, 위험도를 매핑하여 전문적인 진단 보고서를 제공합니다.

### 🛡️ 강력한 세션 보안 및 최적화

Redis Blacklist: 로그아웃된 토큰의 재사용을 원천 차단하여 JWT의 보안 취약점을 보완했습니다.

Fetch Join & Distinct: JPA N+1 문제를 해결하여 대량 데이터 조회 시 성능을 최적화했습니다.

## 📖 API 명세서

---

### 📌 목차

1. [공통 정보]
2. [인증 API]
3. [게시글 API]
4. [이미지 & AI 분석 API]
5. [좋아요 API]
6. [댓글 API]
7. [회원 & 프로필 API]
8. [알림 API]
9. [공공데이터 API]
10. [Flask AI 서버 API]
11. [공통 데이터 모델]

---

### 🌐 Base URL

| 서버 | URL | 설명 |
| --- | --- | --- |
| Spring Boot | `http://localhost:8080` | 메인 백엔드 서버 |
| Flask AI | `http://localhost:5000` | AI 추론 서버 |

### 🔐 인증 방식

JWT Bearer Token 방식을 사용합니다.

```
Authorization: Bearer {accessToken}
```

| 토큰 | 유효기간 | 설명 |
| --- | --- | --- |
| Access Token | 30분 | API 요청 시 사용 |
| Refresh Token | 7일 | 액세스 토큰 재발급 시 사용 |

### 📦 공통 응답 형식

**성공 응답**

```json
HTTP 200 OK
{
  "data": { ... }
}
```

**에러 응답**

```json
HTTP 4xx / 5xx
{
  "status": 400,
  "message": "에러 메시지"
}
```

### 📁 파일 업로드 제한

| 항목 | 제한 |
| --- | --- |
| 단일 파일 최대 크기 | 10MB |
| 요청 전체 최대 크기 | 20MB |
| 허용 이미지 형식 | `image/jpeg`, `image/png`, `image/jpg`, `image/webp` |

---

## 🔐 인증 API (`/auth`)

### 🟢 GET 없음 / 모든 엔드포인트 목록

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| 🔵 `POST` | `/auth/signup` | ❌ | 회원가입 |
| 🔵 `POST` | `/auth/login` | ❌ | 로그인 |
| 🔵 `POST` | `/auth/reissue` | ❌ | 액세스 토큰 재발급 |
| 🔵 `POST` | `/auth/logout` | ✅ | 로그아웃 |

---

### 🔵 POST `/auth/signup` — 회원가입

**Request Body** (`application/json`)

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "홍길동"
}
```

| 필드 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `email` | string | ✅ | 이메일 형식 |
| `password` | string | ✅ | 최소 8자 |
| `username` | string | ✅ | 최대 30자 |

**Response** (`200 OK`)

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "홍길동"
}
```

---

### 🔵 POST `/auth/login` — 로그인

**Request Body** (`application/json`)

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (`200 OK`)

```json
{
  "grantType": "Bearer",
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "accessTokenExpiresIn": 1800000
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `grantType` | string | 항상 `"Bearer"` |
| `accessToken` | string | API 요청에 사용 |
| `refreshToken` | string | 토큰 재발급에 사용 |
| `accessTokenExpiresIn` | long | 만료까지 남은 밀리초 |

---

### 🔵 POST `/auth/reissue` — 액세스 토큰 재발급

**Request Body** (`application/json`)

```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response** (`200 OK`) — `TokenDto` (로그인 응답과 동일)

---

### 🔵 POST `/auth/logout` — 로그아웃

> ✅ 인증 필요 | 토큰이 즉시 Redis 블랙리스트에 등록됩니다.
> 

**Request Header**

```
Authorization: Bearer {accessToken}
```

**Response** (`200 OK`)

```
로그아웃 성공
```

---

## 📝 게시글 API (`/api/posts`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| 🟢 `GET` | `/api/posts` | ❌ | 게시글 목록 (페이징) |
| 🟢 `GET` | `/api/posts/popular` | ❌ | 인기 게시글 목록 |
| 🟢 `GET` | `/api/posts/category/{category}` | ❌ | 카테고리별 게시글 |
| 🟢 `GET` | `/api/posts/{postId}` | ❌ | 게시글 상세 조회 |
| 🟢 `GET` | `/api/posts/search` | ❌ | 게시글 검색 |
| 🔵 `POST` | `/api/posts` | ✅ | 게시글 작성 |
| 🟡 `PUT` | `/api/posts/{postId}` | ✅ | 게시글 수정 |
| 🔴 `DELETE` | `/api/posts/{postId}` | ✅ | 게시글 삭제 |

---

### 🟢 GET `/api/posts` — 게시글 목록

**Query Parameters**

| 파라미터 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `page` | int | 0 | 페이지 번호 |
| `size` | int | 6 | 페이지당 항목 수 |
| `sort` | string | `createdAt,DESC` | 정렬 기준 |

**Response** (`200 OK`) — `Page<PostResponseDto>`

```json
{
  "content": [ { ... PostResponseDto ... } ],
  "totalElements": 100,
  "totalPages": 17,
  "number": 0,
  "size": 6
}
```

---

### 🟢 GET `/api/posts/popular` — 인기 게시글

> 좋아요 수 기준으로 정렬된 게시글 목록
> 

**Query Parameters** — 페이징 동일

**Response** (`200 OK`) — `Page<PostResponseDto>`

---

### 🟢 GET `/api/posts/category/{category}` — 카테고리별 게시글

**Path Parameters**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `category` | string | `QUESTION` 또는 `COMMUNITY` |

**Query Parameters**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `sort` | string | `latest` 또는 `popular` (선택) |

**Response** (`200 OK`) — `Page<PostResponseDto>`

---

### 🟢 GET `/api/posts/{postId}` — 게시글 상세

**Path Parameters**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `postId` | Long | 게시글 ID |

**Response** (`200 OK`) — `PostResponseDto`

```json
{
  "id": 1,
  "title": "우리 집 식물이 아파요",
  "content": "...",
  "writer": "홍길동",
  "memberId": 1,
  "comments": [ { ... CommentResponseDto ... } ],
  "totalLikeCount": 15,
  "category": "QUESTION",
  "createdAt": "2025-03-01T12:00:00",
  "modifiedAt": "2025-03-01T12:30:00",
  "profileImageUrl": "https://..."
}
```

---

### 🟢 GET `/api/posts/search` — 게시글 검색

**Query Parameters**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `type` | string | 검색 유형 (예: `title`, `content`) |
| `keyword` | string | 검색어 |
| `page` | int | 페이지 번호 |
| `size` | int | 페이지당 항목 수 |

**Response** (`200 OK`) — `Page<PostResponseDto>`

---

### 🔵 POST `/api/posts` — 게시글 작성

> ✅ 인증 필요
> 

**Request Body** (`application/json`)

```json
{
  "title": "우리 집 식물이 아파요",
  "content": "잎이 노랗게 변하고 있어요...",
  "imageIds": [1, 2],
  "category": "QUESTION"
}
```

| 필드 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `title` | string | ✅ | 최대 100자 |
| `content` | string | ✅ | - |
| `imageIds` | List\<Long\> | ❌ | 업로드된 이미지 ID 목록 |
| `category` | string | ✅ | `QUESTION` 또는 `COMMUNITY` |

**Response** (`200 OK`) — `PostResponseDto`

---

### 🟡 PUT `/api/posts/{postId}` — 게시글 수정

> ✅ 인증 필요 (작성자 본인만 가능)
> 

**Path Parameters** — `postId`: 게시글 ID

**Request Body** (`application/json`)

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "deleteImageIds": [1],
  "newImageIds": [3],
  "category": "COMMUNITY"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `title` | string | 수정할 제목 |
| `content` | string | 수정할 내용 |
| `deleteImageIds` | List\<Long\> | 삭제할 이미지 ID 목록 |
| `newImageIds` | List\<Long\> | 새로 추가할 이미지 ID 목록 |
| `category` | string | `QUESTION` 또는 `COMMUNITY` |

**Response** (`200 OK`) — `PostResponseDto`

---

### 🔴 DELETE `/api/posts/{postId}` — 게시글 삭제

> ✅ 인증 필요 (작성자 본인만 가능)
> 

**Path Parameters** — `postId`: 게시글 ID

**Response** (`200 OK`)

```
게시글 삭제 완료
```

---

## 🤖 이미지 & AI 분석 API

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| 🔵 `POST` | `/api/posts/upload-image` | ❌ | 이미지 업로드 |
| 🟢 `GET` | `/api/posts/images/{imageId}/analyze` | ❌ | AI 분석 결과 조회 |

---

### 🔵 POST `/api/posts/upload-image` — 이미지 업로드

**Request** (`multipart/form-data`)

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `image` | File | 업로드할 이미지 파일 |

**Response** (`200 OK`)

```json
{
  "id": 1,
  "imageUrl": "https://.../uploads/abc123.jpg"
}
```

---

### 🟢 GET `/api/posts/images/{imageId}/analyze` — AI 분석 결과 조회

> 업로드된 이미지에 대해 식물 종류와 질병을 AI로 분석한 결과를 반환합니다.
> 

**Path Parameters**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `imageId` | Long | 업로드된 이미지 ID |

**Response** (`200 OK`) — `AiAnalysisResponseDto`

```json
{
  "imageId": 1,
  "status": "SUCCESS",
  "resultImgUrl": "https://.../uploads/combined_abc123.jpg",
  "plantLabel": "PeaceLily",
  "plantNameKr": "스파티필럼",
  "plantDescription": "열대 아메리카 원산의 관엽식물입니다...",
  "diseaseLabel": "curling",
  "diseaseNameKr": "잎말림",
  "diseaseConfidence": 0.78,
  "symptoms": "잎 가장자리가 안쪽으로 말립니다.",
  "solutions": "수분 공급량을 늘리고 직사광선을 피하세요.",
  "prevention": "규칙적인 물 주기와 적절한 습도 유지가 중요합니다.",
  "dangerLevel": "MEDIUM"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `status` | string | `SUCCESS` 또는 `FAILED` |
| `plantLabel` | string | AI 모델의 식물 레이블 |
| `plantNameKr` | string | 식물 한국어 이름 |
| `plantDescription` | string | 식물 설명 |
| `diseaseLabel` | string | AI 모델의 질병 레이블 |
| `diseaseNameKr` | string | 질병 한국어 이름 |
| `diseaseConfidence` | double | 질병 감지 신뢰도 (0.0 ~ 1.0) |
| `symptoms` | string | 증상 설명 |
| `solutions` | string | 해결 방법 |
| `prevention` | string | 예방법 |
| `dangerLevel` | string | 위험도: 🟢 `LOW` / 🟡 `MEDIUM` / 🔴 `HIGH` |

---

## ❤️ 좋아요 API

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| 🔵 `POST` | `/api/posts/{postId}/like` | ✅ | 좋아요 추가 |
| 🔴 `DELETE` | `/api/posts/{postId}/like` | ✅ | 좋아요 취소 |
| 🟢 `GET` | `/api/posts/{postId}/like` | ❌ | 좋아요 상태 조회 |

**Response** — `PostLikeDto`

```json
{
  "postId": 1,
  "totalLikeCount": 15,
  "isLiked": true
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `postId` | Long | 게시글 ID |
| `totalLikeCount` | long | 전체 좋아요 수 |
| `isLiked` | boolean | 현재 사용자의 좋아요 여부 |

---

## 💬 댓글 API

> 계층형 댓글을 지원합니다. `parentId`를 지정하면 대댓글이 됩니다.
> 

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| 🔵 `POST` | `/api/posts/{postId}/comments` | ✅ | 댓글 작성 |
| 🟡 `PUT` | `/api/comments/{commentId}` | ✅ | 댓글 수정 |
| 🔴 `DELETE` | `/api/comments/{commentId}` | ✅ | 댓글 삭제 |

---

### 🔵 POST `/api/posts/{postId}/comments` — 댓글 작성

> ✅ 인증 필요
> 

**Path Parameters** — `postId`: 게시글 ID

**Request Body** (`application/json`)

```json
{
  "content": "저도 같은 경험이 있어요!",
  "parentId": null
}
```

| 필드 | 타입 | 필수 | 제약 |
| --- | --- | --- | --- |
| `content` | string | ✅ | 최대 500자 |
| `parentId` | Long | ❌ | `null`이면 최상위 댓글, 값이 있으면 대댓글 |

**Response** (`200 OK`) — `CommentResponseDto`

```json
{
  "id": 10,
  "parentId": null,
  "content": "저도 같은 경험이 있어요!",
  "children": [],
  "writer": "홍길동",
  "memberId": 1,
  "createdAt": "2025-03-01T12:00:00",
  "modifiedAt": "2025-03-01T12:00:00",
  "isDeleted": false,
  "profileImageUrl": "https://..."
}
```

---

### 🟡 PUT `/api/comments/{commentId}` — 댓글 수정

> ✅ 인증 필요 (작성자 본인만 가능)
> 

**Path Parameters** — `commentId`: 댓글 ID

**Request Body** (`application/json`)

```json
{
  "content": "수정된 댓글 내용",
  "parentId": null
}
```

**Response** (`200 OK`) — `CommentResponseDto`

---

### 🔴 DELETE `/api/comments/{commentId}` — 댓글 삭제

> ✅ 인증 필요 (작성자 본인만 가능)
> 

**Path Parameters** — `commentId`: 댓글 ID

**Response** (`200 OK`)

```
댓글 삭제 완료
```

---

## 👤 회원 & 프로필 API (`/api/members`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| 🟢 `GET` | `/api/members/me` | ✅ | 내 정보 조회 |
| 🟢 `GET` | `/api/members/{memberId}/profile` | ❌ | 프로필 조회 |
| 🟡 `PUT` | `/api/members/me/profile` | ✅ | 프로필 수정 |
| 🟢 `GET` | `/api/members/{memberId}/mypage` | ❌ | 마이페이지 조회 |
| 🟢 `GET` | `/api/members/{memberId}/followers` | ✅ | 팔로워 목록 |
| 🟢 `GET` | `/api/members/{memberId}/followings` | ✅ | 팔로잉 목록 |
| 🔵 `POST` | `/api/members/{memberId}/follow` | ✅ | 팔로우 |
| 🔴 `DELETE` | `/api/members/{memberId}/follow` | ✅ | 팔로우 취소 |

---

### 🟢 GET `/api/members/me` — 내 정보 조회

> ✅ 인증 필요
> 

**Response** (`200 OK`)

```json
{
  "memberId": 1
}
```

---

### 🟢 GET `/api/members/{memberId}/profile` — 프로필 조회

**Path Parameters** — `memberId`: 회원 ID

**Response** (`200 OK`)

```json
{
  "username": "홍길동",
  "bio": "식물 애호가입니다.",
  "profileImageUrl": "https://...",
  "websiteUrl": "<https://myblog.com>"
}
```

---

### 🟡 PUT `/api/members/me/profile` — 프로필 수정

> ✅ 인증 필요
> 

**Request** (`multipart/form-data`)

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `profile` | JSON (string) | ✅ | 프로필 정보 JSON |
| `image` | File | ❌ | 프로필 이미지 파일 |

**`profile` JSON 형식**

```json
{
  "username": "홍길동",
  "bio": "식물 애호가입니다.",
  "websiteUrl": "<https://myblog.com>"
}
```

| 필드 | 타입 | 제약 |
| --- | --- | --- |
| `username` | string | 최대 30자 |
| `bio` | string | 자기소개 |
| `websiteUrl` | string | URL 형식 |

**Response** (`200 OK`) — `ProfileResponseDto`

---

### 🟢 GET `/api/members/{memberId}/mypage` — 마이페이지

**Path Parameters** — `memberId`: 회원 ID

**Response** (`200 OK`)

```json
{
  "username": "홍길동",
  "email": "user@example.com",
  "postCount": 10,
  "likeCount": 25,
  "followerCount": 50,
  "followingCount": 30,
  "isFollowing": false,
  "isFollower": true,
  "posts": [ { ... PostResponseDto ... } ],
  "likePosts": [ { ... PostResponseDto ... } ]
}
```

---

### 🟢 GET `/api/members/{memberId}/followers` — 팔로워 목록

> ✅ 인증 필요
> 

**Path Parameters** — `memberId`: 회원 ID

**Response** (`200 OK`) — `List<FollowListResponseDto>`

```json
[
  {
    "memberId": 2,
    "username": "김철수",
    "profileImageUrl": "https://...",
    "isFollowing": true
  }
]
```

---

### 🟢 GET `/api/members/{memberId}/followings` — 팔로잉 목록

> ✅ 인증 필요
> 

**Response** (`200 OK`) — `List<FollowListResponseDto>` (팔로워 목록과 동일 구조)

---

### 🔵 POST `/api/members/{memberId}/follow` — 팔로우

> ✅ 인증 필요
> 

**Path Parameters** — `memberId`: 팔로우할 회원 ID

**Response** (`200 OK`) — `FollowResponseDto`

---

### 🔴 DELETE `/api/members/{memberId}/follow` — 팔로우 취소

> ✅ 인증 필요
> 

**Path Parameters** — `memberId`: 팔로우 취소할 회원 ID

**Response** (`200 OK`)

```
팔로우가 취소되었습니다.
```

---

## 🔔 알림 API (`/api/notifications`)

> 서버-센트 이벤트(SSE)를 이용한 실시간 알림을 제공합니다.
> 

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| 🟢 `GET` | `/api/notifications/subscribe` | ✅ | SSE 실시간 알림 구독 |
| 🟢 `GET` | `/api/notifications` | ✅ | 전체 알림 목록 |
| 🟢 `GET` | `/api/notifications/notread` | ✅ | 읽지 않은 알림 목록 |
| 🟡 `PUT` | `/api/notifications/{notificationId}/read` | ✅ | 알림 읽음 처리 |

---

### 🟢 GET `/api/notifications/subscribe` — SSE 구독

> ✅ 인증 필요 | `text/event-stream` 스트림으로 실시간 알림을 수신합니다.
> 

**Response** — `text/event-stream`

```
data: {"id":1,"receiver":"홍길동","content":"홍길동님의 게시글에 댓글이 달렸습니다.","type":"COMMENT","targetId":5,"isRead":false,"createdAt":"2025-03-01T12:00:00"}
```

---

### 🟢 GET `/api/notifications` — 전체 알림 목록

> ✅ 인증 필요
> 

**Response** (`200 OK`) — `List<NotificationDto>`

```json
[
  {
    "id": 1,
    "receiver": "홍길동",
    "content": "홍길동님의 게시글에 댓글이 달렸습니다.",
    "type": "COMMENT",
    "targetId": 5,
    "isRead": false,
    "createdAt": "2025-03-01T12:00:00"
  }
]
```

---

### 🟢 GET `/api/notifications/notread` — 읽지 않은 알림

> ✅ 인증 필요
> 

**Response** (`200 OK`) — `List<NotificationDto>` (전체 알림 목록과 동일 구조)

---

### 🟡 PUT `/api/notifications/{notificationId}/read` — 읽음 처리

> ✅ 인증 필요
> 

**Path Parameters** — `notificationId`: 알림 ID

**Response** (`204 No Content`)

---

## 📊 공공데이터 API (`/api/publicData`)

> 농사로 외부 API와 연동하여 식물 백과사전 데이터를 제공합니다.
> 

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| 🟢 `GET` | `/api/publicData` | ❌ | 식물 목록 조회 |
| 🟢 `GET` | `/api/publicData/{cntntsNo}` | ❌ | 식물 상세 조회 |

---

### 🟢 GET `/api/publicData` — 식물 목록 조회

**Query Parameters**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `pageNo` | int | 페이지 번호 |
| `numOfRows` | int | 페이지당 항목 수 |
| `sType` | string | 검색 유형 |
| `sText` | string | 검색어 |
| `wordType` | string | 단어 유형 |
| `word` | string | 단어 |
| `lightChkVal` | string | 빛 조건 필터 |
| `grwhstleChkVal` | string | 생육 형태 필터 |
| `lefcolrChkVal` | string | 잎 색상 필터 |
| `ignSeasonChkVal` | string | 개화 계절 필터 |

**Response** (`200 OK`) — `PlantApiResponseDto`

---

### 🟢 GET `/api/publicData/{cntntsNo}` — 식물 상세 조회

**Path Parameters**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `cntntsNo` | string | 농사로 콘텐츠 번호 |

**Response** (`200 OK`) — `PlantDetailResponseDto`

---

## 🤖 Flask AI 서버 API

> **Base URL**: `http://localhost:5000`
YOLO 기반 AI 모델로 식물 종류 및 질병을 감지합니다.
> 

| 메서드 | 경로 | Rate Limit | 인증 | 설명 |
| --- | --- | --- | --- | --- |
| 🟢 `GET` | `/health` | 없음 | ❌ | 서버 상태 확인 |
| 🔵 `POST` | `/detect` | 10회/분 | ❌ | 식물·질병 AI 분석 |

---

### 🟢 GET `/health` — 헬스체크

**Response** (`200 OK`)

```json
{
  "status": "healthy"
}
```

---

### 🔵 POST `/detect` — 식물·질병 AI 분석

> ⚠️ Rate Limit: **10회/분** 초과 시 `429 Too Many Requests`
> 

**Request** (`multipart/form-data`)

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `image` | File | ✅ | 분석할 식물 이미지 |

**허용 형식**: `image/jpeg`, `image/png`, `image/jpg`, `image/webp`

**Response** (`200 OK`)

```json
{
  "status": "success",
  "filename": "unique-uuid.jpg",
  "plant_result_image": "combined_unique-uuid.jpg",
  "results": {
    "plant_detection": [
      {
        "label": "PeaceLily",
        "confidence": 0.72
      }
    ],
    "disease_analysis": [
      {
        "label": "curling",
        "confidence": 0.78
      }
    ]
  }
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `status` | string | `"success"` |
| `filename` | string | 저장된 원본 이미지 파일명 |
| `plant_result_image` | string | AI 감지 결과가 표시된 합성 이미지 파일명 |
| `results.plant_detection` | array | 식물 감지 결과 목록 |
| `results.disease_analysis` | array | 질병 분석 결과 목록 |

**에러 응답 (`400 Bad Request`)** — 지원하지 않는 파일 형식

```json
{
  "error": "지원되지 않는 파일 형식입니다. (감지된 형식: image/gif)"
}
```

**에러 응답 (`500 Internal Server Error`)** — AI 모델 오류

```json
{
  "status": "FAILED",
  "error": "AI 모델 분석 중 오류가 발생했습니다."
}
```

---

## 📦 공통 데이터 모델

### TokenDto — JWT 토큰 정보

```json
{
  "grantType": "Bearer",
  "accessToken": "string",
  "refreshToken": "string",
  "accessTokenExpiresIn": 1800000
}
```

---

### PostResponseDto — 게시글 응답

```json
{
  "id": 1,
  "title": "string",
  "content": "string",
  "writer": "string",
  "memberId": 1,
  "comments": [ "CommentResponseDto" ],
  "totalLikeCount": 0,
  "category": "QUESTION | COMMUNITY",
  "createdAt": "2025-03-01T12:00:00",
  "modifiedAt": "2025-03-01T12:00:00",
  "profileImageUrl": "string"
}
```

---

### CommentResponseDto — 댓글 응답

```json
{
  "id": 1,
  "parentId": null,
  "content": "string",
  "children": [ "CommentResponseDto" ],
  "writer": "string",
  "memberId": 1,
  "createdAt": "2025-03-01T12:00:00",
  "modifiedAt": "2025-03-01T12:00:00",
  "isDeleted": false,
  "profileImageUrl": "string"
}
```

---

### AiAnalysisResponseDto — AI 분석 결과

```json
{
  "imageId": 1,
  "status": "SUCCESS | FAILED",
  "resultImgUrl": "string",
  "plantLabel": "string",
  "plantNameKr": "string",
  "plantDescription": "string",
  "diseaseLabel": "string",
  "diseaseNameKr": "string",
  "diseaseConfidence": 0.78,
  "symptoms": "string",
  "solutions": "string",
  "prevention": "string",
  "dangerLevel": "LOW | MEDIUM | HIGH"
}
```

---

### NotificationDto — 알림

```json
{
  "id": 1,
  "receiver": "string",
  "content": "string",
  "type": "string",
  "targetId": 1,
  "isRead": false,
  "createdAt": "2025-03-01T12:00:00"
}
```

---

### FollowListResponseDto — 팔로우 목록 항목
```json
{
  "memberId": 1,
  "username": "string",
  "profileImageUrl": "string",
  "isFollowing": true

```

## 🚨 핵심 Error Code

### 👤 사용자 및 소셜

| 에러 코드 명칭 | HTTP 상태코드 | 설명 |
| --------------------------------- | -------------| --------------------------------------|
| `MEMBER_NOT_FOUND` | 404  | 존재하지 않는 회원 조회시 |
| `DUPLICATE_EMAIL`  | 409 | 이미 가입된 이메일로 가입시 |
| `INVALID_PASSWORD` | 401 | 로그인 시 비밀번호 불일치 |
| `UNAUTHORIZED_MEMBER` | 401 | 토큰이 없거나 만료된 경우 |
| `ACCESS_DENIED` | 403 | 본인 글이 아닌데 수정/삭제 시 |




