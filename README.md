# 🪴 TreeWithMe #
## AI 진단부터 데이터 검색까지, 사진 한 장으로 시작하는 스마트한 식물 생활! ##

<img src="https://github.com/user-attachments/assets/1e0529d2-4be1-41ab-b0af-72691da20e12" width="600" />

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

## 🌟 주요 기능

### 🧩 SNS 기반 게시판 및 검색 시스템

이미지 선행 업로드(Pre-upload) 방식을 통해 서버 자원을 효율적으로 관리합니다.

팔로우, 좋아요등 SNS 기능을 통해서 사용자들이 자유롭게 소통 할 수 있습니다.

게시글 정보(제목, 내용, 작성자)뿐만 아니라 게시글 이미지의 식물 종류, 병충해까지 검색 가능합니다.

### 🔍 AI 식물 진단 & 농사로 식물 도감 연동

업로드된 이미지를 학습한 ML모델이 분석하여 식물명과 병해명을 도출합니다.

농촌진흥청에서 제공하는 실내 식물 DB를 불러와 전문적인 정보를 제공합니다.

### 🛡️ 로그인 보안

로그아웃된 토큰의 재사용을 원천 차단하여 JWT의 보안 취약점을 보완했습니다.


---------------------------------------------------

<h2> 👥 서비스 대상</h2>

- 키우는 식물의 종류와 질병을 확인하고 싶은 초보 식물 집사들
- 식물을 키우는 사람들과 소통하고 싶은 사람들

------------------------------------------------

<h2> 💌 서비스 화면 및 기능 소개 </h2>

### ✅ 메인 페이지 화면 ###
- 커뮤니티, Q&A 카테고리
> 최신순, 좋아요 순으로 정렬해서 게시글을 확인 할 수 있습니다.

<img src="https://github.com/mino-su/Plant_ai_blog/blob/main/readme_assets/category_c.gif" width="600" />



--------------------------------------------------------

- 알림 기능
> 게시글 좋아요, 게시글 댓글, 팔로우 시 알림을 확인 할 수 있습니다.


<img src="https://github.com/mino-su/Plant_ai_blog/blob/main/readme_assets/comment_c.gif" width="600" />



--------------------------------------------------------


- 검색 기능
> 게시글 제목, 내용, 작성자, 게시글 내 이미지의 식물 종류 및 질병 결과를 검색으로 확인 할 수 있습니다.


<img src="https://github.com/mino-su/Plant_ai_blog/blob/main/readme_assets/search_c.gif" width="600" />

--------------------------------------------------------



### ✅ 게시판 상세 화면 ###
- AI 식물 종류, 질병 추론 기능
> 식물 사진을 올리고 게시글을 작성하면 실시간으로 식물 정보 및 질병을 추론해서 확인 할 수 있습니다.
> 
> 자세한 결과 보기를 누르면 ML모델이 어떻게 탐지 했는지 확인 할 수 있습니다.

<img src="https://github.com/mino-su/Plant_ai_blog/blob/main/readme_assets/detect_c.gif" width="300"/>

--------------------------------------------------------

### ✅ 마이 페이지 화면 ###
- 팔로우 기능
> 팔로우, 팔로잉 한 사용자들을 한번에 확인 할 수 있습니다.

- 좋아요한 페이지 모아보기
> 해당 사용자가 좋아요 한 게시판을 한번에 확인 할 수 있습니다.

<img src="https://github.com/mino-su/Plant_ai_blog/blob/main/readme_assets/mypage_c.gif" width="600"/>


- 내 정보 수정
> 해당 사용자의 프로필 사진, 닉네임, 소개글, url을 수정할 수 있습니다.

<img src="https://github.com/mino-su/Plant_ai_blog/blob/main/readme_assets/setting_c.gif" width="600"/>

--------------------------------------------------------

### ✅ 식물 도감 화면 ###
- 농사로 식물 도감 기능
> 농촌진흥청 농사로에서 제공하는 실내 식물 DB를 불러와서 자세한 내용을 확인 할 수 있습니다.

<img src="https://github.com/mino-su/Plant_ai_blog/blob/main/readme_assets/plantDictionary_c.gif" width="600"/>


--------------------------------------------------------

## 📜  프로젝트 산출물 ##

### 시스템 아키텍처 ###

<img width="1305" height="752" alt="시스템아키텍처_최종" src="https://github.com/user-attachments/assets/b1273ff1-cc68-4640-91ef-9c9ffeaff492" />

### ERD ###
<img width="1398" height="1195" alt="ERD_TreeWithMe" src="https://github.com/user-attachments/assets/7ed00dfa-5933-4338-8910-b264481358b5" />



## ⚒️ 기술 스택

---

### FE

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

### BE

![Java](https://img.shields.io/badge/Java_21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![QueryDSL](https://img.shields.io/badge/QueryDSL-0769AD?style=for-the-badge&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

### AI

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![YOLO](https://img.shields.io/badge/YOLO_v8%2Fv11-00FFFF?style=for-the-badge&logoColor=black)

---

### DB

![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

---

### Dev-Ops

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Amazon EC2](https://img.shields.io/badge/Amazon_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![Amazon S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)
![NGINX](https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=nginx&logoColor=white)


## 📖 API 명세서

<details markdown="1">
  <summary> <h4> 📋 공통 정보 </h4> </summary>
  <ul>
   <img width="720" height="556" alt="스크린샷 2026-03-30 오후 12 37 06" src="https://github.com/user-attachments/assets/d3d01a06-b5e4-4612-b04b-b7ebb586ed41" />
   <img width="737" height="500" alt="스크린샷 2026-03-30 오후 12 37 17" src="https://github.com/user-attachments/assets/0d74edcd-9dc5-4902-b477-de9b6af5d2fb" />
   <img width="705" height="237" alt="스크린샷 2026-03-30 오후 12 37 23" src="https://github.com/user-attachments/assets/29bbebe2-a767-479e-af20-d090b6e77afd" />
  </ul>
</details>

<details markdown="1">
  <summary> <h4> 🔐 인증 API </h4> </summary>
  <ul>
   <img width="719" height="258" alt="스크린샷 2026-03-30 오후 12 40 03" src="https://github.com/user-attachments/assets/3f7c2772-cf47-4355-8ef3-299be4e903ea" />
   <img width="758" height="698" alt="스크린샷 2026-03-30 오후 12 40 14" src="https://github.com/user-attachments/assets/13357ebb-0d08-4b41-90b6-2540cdce4031" />
   <img width="756" height="729" alt="스크린샷 2026-03-30 오후 12 40 20" src="https://github.com/user-attachments/assets/ee641146-4750-42d6-9531-e52a1682f0eb" />
   <img width="762" height="707" alt="스크린샷 2026-03-30 오후 12 40 27" src="https://github.com/user-attachments/assets/f7b34dc4-c34d-49f9-bf2f-83657edff7b2" />
  </ul>
</details>

<details markdown="1">
  <summary> <h4> 📝 게시글 API </h4> </summary>
  <ul>
   <img width="723" height="407" alt="스크린샷 2026-03-30 오후 12 42 36" src="https://github.com/user-attachments/assets/d2c1fa87-02b4-411f-9136-2447ff47bcbe" />
   <img width="734" height="553" alt="스크린샷 2026-03-30 오후 12 42 42" src="https://github.com/user-attachments/assets/de24c91e-8624-4471-9900-8cb30afb524d" />
   <img width="720" height="599" alt="스크린샷 2026-03-30 오후 12 42 49" src="https://github.com/user-attachments/assets/6a2ba9a8-1239-49e1-955a-c28bfbf99acf" />
   <img width="742" height="596" alt="스크린샷 2026-03-30 오후 12 42 56" src="https://github.com/user-attachments/assets/5d06637e-13b3-4ee2-a48f-d1535d183d9a" />
   <img width="730" height="358" alt="스크린샷 2026-03-30 오후 12 43 03" src="https://github.com/user-attachments/assets/deea9f88-b5d9-4930-b31c-af006b3f4515" />
   <img width="774" height="603" alt="스크린샷 2026-03-30 오후 12 43 13" src="https://github.com/user-attachments/assets/a267cbc5-7eee-4536-abbb-209492a4c3a4" />
   <img width="759" height="695" alt="스크린샷 2026-03-30 오후 12 43 21" src="https://github.com/user-attachments/assets/d859bbbe-bd52-4461-9900-9a296df122db" />
   <img width="739" height="286" alt="스크린샷 2026-03-30 오후 12 43 29" src="https://github.com/user-attachments/assets/1011313e-745d-4039-84a5-1eceff5892f2" />
  </ul>
  
</details>

<details markdown="1">
  <summary> <h4> 🏞️ 이미지 & AI 분석 API </h4> </summary>
  <ul>
   <img width="707" height="226" alt="스크린샷 2026-03-30 오후 12 45 10" src="https://github.com/user-attachments/assets/de4d65f5-dca3-4181-a425-5c7ae2aebfd5" />
   <img width="734" height="422" alt="스크린샷 2026-03-30 오후 12 45 18" src="https://github.com/user-attachments/assets/61aa0032-7205-42e6-8d9c-592b44f6f360" />
   <img width="772" height="699" alt="스크린샷 2026-03-30 오후 12 45 26" src="https://github.com/user-attachments/assets/664189b4-550c-4552-bbe2-3e77d7f63982" />
   <img width="703" height="471" alt="스크린샷 2026-03-30 오후 12 45 34" src="https://github.com/user-attachments/assets/26129b9f-4493-4b43-8597-55cffb375954" />
  </ul>
</details>

<details markdown="1">
  <summary> <h4> ❤️ 좋아요 API </h4> </summary>
  <ul>
   <img width="805" height="660" alt="스크린샷 2026-03-30 오후 12 47 17" src="https://github.com/user-attachments/assets/b22cc97e-78bd-4932-b622-e886e6c6d62e" />
  </ul>
</details>

<details markdown="1">
  <summary> <h4> 💬 댓글 API  </h4> </summary>
  <ul>
   <img width="727" height="279" alt="스크린샷 2026-03-30 오후 12 47 51" src="https://github.com/user-attachments/assets/2c4a97b1-6c1a-4f99-ae9c-b7de12ecf383" />
   <img width="749" height="511" alt="스크린샷 2026-03-30 오후 12 47 58" src="https://github.com/user-attachments/assets/b661b696-b0a8-4e64-b286-dd8f794caffb" />
   <img width="749" height="394" alt="스크린샷 2026-03-30 오후 12 48 10" src="https://github.com/user-attachments/assets/4ff0e672-a0fc-4008-aec6-135c200649b3" />
   <img width="750" height="383" alt="스크린샷 2026-03-30 오후 12 48 17" src="https://github.com/user-attachments/assets/3cc99fdf-72e7-47c1-8c28-d5393f466431" />
   <img width="733" height="285" alt="스크린샷 2026-03-30 오후 12 48 25" src="https://github.com/user-attachments/assets/78947366-b3d6-45c1-8f6e-ce771d5d23e5" />
  </ul>
</details>

<details markdown="1">
  <summary> <h4> 👤 회원 & 프로필 API </h4> </summary>
  <ul>
   <img width="713" height="423" alt="스크린샷 2026-03-30 오후 12 49 32" src="https://github.com/user-attachments/assets/355af16b-61cf-4b1d-b06c-fb5e09590db0" />
   <img width="726" height="288" alt="스크린샷 2026-03-30 오후 12 49 40" src="https://github.com/user-attachments/assets/1b23282a-68b4-4d5f-97bc-aecea47829f3" />
   <img width="725" height="350" alt="스크린샷 2026-03-30 오후 12 49 47" src="https://github.com/user-attachments/assets/24df770a-0cdb-4e59-82e6-d4c3eaa064d7" />
   <img width="738" height="744" alt="스크린샷 2026-03-30 오후 12 50 09" src="https://github.com/user-attachments/assets/f64cd673-0cfe-4249-bdb9-2215f8f90a44" />
   <img width="728" height="457" alt="스크린샷 2026-03-30 오후 12 50 18" src="https://github.com/user-attachments/assets/d54b9f01-f89c-4629-ac71-d9a648847744" />
   <img width="718" height="572" alt="스크린샷 2026-03-30 오후 12 50 34" src="https://github.com/user-attachments/assets/84bca13e-4698-478e-a96d-6e849bb4deb0" />
   <img width="736" height="478" alt="스크린샷 2026-03-30 오후 12 50 44" src="https://github.com/user-attachments/assets/b574dae3-efbc-438a-ab17-b9ee5f338265" />
  </ul> 
</details>

<details markdown="1">
  <summary> <h4> 🔔 알림 API </h4> </summary>
  <ul>
   <img width="729" height="633" alt="스크린샷 2026-03-30 오후 1 58 33" src="https://github.com/user-attachments/assets/49babdcf-7bf0-478b-b531-6d2f26c02e4e" />
   <img width="747" height="587" alt="스크린샷 2026-03-30 오후 1 58 42" src="https://github.com/user-attachments/assets/22c044dd-3dfe-49fe-919d-e33044975d9c" />
   <img width="683" height="174" alt="스크린샷 2026-03-30 오후 1 58 48" src="https://github.com/user-attachments/assets/936d3218-c2ca-41d5-8401-ed0ba1ef6f4b" />
  </ul>
</details>

<details markdown="1">
  <summary> <h4> 📊 공공데이터 API </h4> </summary>
  <ul>
   <img width="719" height="250" alt="스크린샷 2026-03-30 오후 1 58 53" src="https://github.com/user-attachments/assets/f6d34ddc-2a68-4350-b24e-7a5228ec326b" />
   <img width="674" height="521" alt="스크린샷 2026-03-30 오후 1 59 01" src="https://github.com/user-attachments/assets/eea244ed-242c-4cc6-bb3c-373c79ec6a1a" />
   <img width="693" height="252" alt="스크린샷 2026-03-30 오후 1 59 08" src="https://github.com/user-attachments/assets/2fa25001-55d4-44db-b6c0-8d0cf3500707" />
  </ul>
</details>

<details markdown="1">
  <summary> <h4> 🤖 Flask AI 서버 API </h4> </summary>
  <ul>
   <img width="728" height="282" alt="스크린샷 2026-03-30 오후 1 59 14" src="https://github.com/user-attachments/assets/79c1b50d-6edf-4f0c-b39b-bc9ea02b2a85" />
   <img width="730" height="242" alt="스크린샷 2026-03-30 오후 1 59 24" src="https://github.com/user-attachments/assets/689f742c-9332-436a-b8b4-7ce0e10c227c" />
   <img width="718" height="329" alt="스크린샷 2026-03-30 오후 1 59 44" src="https://github.com/user-attachments/assets/dc1b8526-24dd-4ace-bd99-3fc9ec2b2e48" />
   <img width="734" height="737" alt="스크린샷 2026-03-30 오후 1 59 56" src="https://github.com/user-attachments/assets/5dfde939-f174-494f-b14d-b930e21eaed3" />
   <img width="725" height="408" alt="스크린샷 2026-03-30 오후 2 00 03" src="https://github.com/user-attachments/assets/559814a1-e3a9-4ae3-925a-efe4d601a2d3" />
  </ul>
</details>





