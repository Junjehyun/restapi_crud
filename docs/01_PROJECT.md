# restapi_crud

## 1. 프로젝트 목적

이 프로젝트의 **1차 목적**은 보험 도메인을 깊게 파는 것이 아니라,

> **Laravel MVC에 익숙한 개발자가 React + Spring Boot 조합을 한 바퀴 완성하는 것**

이다.

문서의 **읽는 순서 · 지금 할 일** 은 `docs/00_README.md` 를 본다.

보험상품관리 CRUD는 그 목적을 위한 **연습 소재**다.  
도메인·테이블 설계는 아직 확정하지 않았으며, 나중에 구성한다.

| 항목 | 내용 |
|------|------|
| 프로젝트명 | `restapi_crud` |
| 학습 목표 | React(SPA) ↔ Spring Boot(REST API) 분리 구조 체득 |
| 연습 소재 | 보험상품관리 간단 CRUD (미확정) |
| 아키텍처 | Backend / Frontend 분리 (Monorepo) |
| Backend | Java 21 + Spring Boot 4.1 + Spring Data JPA |
| Frontend | React 19 + TypeScript + Vite |
| Database | MySQL |
| 통신 | REST API (JSON) |

### Laravel 관점으로 보는 이 스택

| Laravel (익숙한 쪽) | 이 프로젝트 |
|---------------------|-------------|
| Blade / Livewire 등 서버 렌더링 | **React SPA** (화면은 프론트가 담당) |
| `routes/*` + Controller | Spring `@RestController` (JSON API) |
| Eloquent Model | JPA **Entity** |
| Eloquent / Query Builder | Spring Data JPA **Repository** |
| Service / Action 클래스 | Spring **Service** |
| Form Request / Resource | **DTO** (요청·응답 계약) |
| `config/*`, CORS 미들웨어 | **config** 패키지 |
| `php artisan serve` + 프론트 없음(또는 혼재) | **8080(API) + 5173(UI)** 분리 실행 |

핵심 감각 차이:

- Laravel은 종종 **한 앱 안에서** 라우트 → 뷰까지 처리한다.
- 여기서는 **프론트가 UI**, **백엔드가 API만** 담당한다. 화면 HTML을 Spring이 내려주지 않는다.

```
[ Browser ]
     │  HTTP (axios)
     ▼
[ React + TypeScript (Vite) ]  ← frontend/  (기본 포트: 5173)
     │  REST API (JSON)
     ▼
[ Spring Boot (Web MVC) ]      ← 루트 src/  (기본 포트: 8080)
     │  JPA / Hibernate
     ▼
[ MySQL ]                      ← DB: restapi_crud
```

---

## 2. 연습 소재: 보험상품관리 CRUD

> 아직 확정 아님. 테이블·컬럼 설계는 보류.

의도만 잡는다.

| 구분 | 방향 |
|------|------|
| 도메인 | 보험 **상품**을 등록·조회·수정·삭제하는 관리 화면 |
| 범위 | 단일 리소스 기준의 간단한 CRUD (연관·권한·결제 등은 비목표) |
| 백엔드 | REST 엔드포인트 + 계층 분리 (Controller → Service → Repository) |
| 프론트 | 목록 / 상세(또는 폼) / 생성·수정·삭제 UI + API 연동 |
| 비목표 | 실무 수준의 보험 업무 로직, 복잡한 스키마, 인증(당장은) |

학습으로 가져갈 것:

1. 계층을 나눠 API를 만드는 흐름 (Laravel 레이어드 감각 → Spring 패키지 감각)
2. Entity / DTO를 구분하는 이유
3. React에서 axios로 API 호출하고 화면 상태를 다루는 흐름
4. CORS 또는 Vite proxy로 FE·BE를 붙이는 방법

---

## 3. 디렉터리 구조

```
restapi_crud/
├── build.gradle                 # Backend 의존성·빌드
├── settings.gradle              # 프로젝트명: restapi_crud
├── gradlew / gradlew.bat
├── gradle/wrapper/
├── HELP.md
├── docs/00_README.md            # 학습 문서 목차
│
├── src/                         # ===== Backend (Spring Boot) =====
│   ├── main/
│   │   ├── java/com/yama331/restapi_crud/
│   │   │   ├── RestapiCrudApplication.java
│   │   │   ├── controller/      # HTTP 입구 (Laravel Controller)
│   │   │   ├── service/         # 비즈니스 로직
│   │   │   ├── repository/      # DB 접근 (Eloquent 느낌)
│   │   │   ├── entity/          # 테이블 매핑 (Eloquent Model)
│   │   │   ├── dto/             # 요청·응답 계약
│   │   │   └── config/          # CORS 등 전역 설정
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/yama331/restapi_crud/
│
└── frontend/                    # ===== Frontend (React + TS) =====
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig*.json
    ├── index.html
    ├── public/
    └── src/
        ├── main.tsx
        ├── App.tsx              # 현재 Vite 기본 템플릿
        ├── App.css / index.css
        └── assets/
```

각 백엔드 패키지 역할은 폴더 안 `README.md`에 Laravel 비유로 정리해 두었다.

---

## 4. Backend

### 4.1 기본 정보

| 항목 | 값 |
|------|-----|
| Group | `com.yama331` |
| Package | `com.yama331.restapi_crud` |
| Main Class | `RestapiCrudApplication` |
| Java | 21 |
| Build | Gradle |
| Spring Boot | 4.1.0 |

### 4.2 주요 의존성 (`build.gradle`)

| 의존성 | 용도 |
|--------|------|
| `spring-boot-starter-webmvc` | REST API (Spring MVC) |
| `spring-boot-starter-data-jpa` | JPA / Hibernate |
| `mysql-connector-j` | MySQL 드라이버 |
| `lombok` | 보일러플레이트 감소 |
| `spring-boot-devtools` | 개발 시 자동 재시작 |

### 4.3 설정 (`application.properties`)

| 키 | 설명 |
|----|------|
| `spring.application.name` | `restapi_crud` |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/restapi_crud` |
| `spring.jpa.hibernate.ddl-auto` | `update` (엔티티 기준 스키마 반영) |
| `spring.jpa.show-sql` | `true` |

### 4.4 현재 상태

```
com.yama331.restapi_crud
├── RestapiCrudApplication
├── controller/MainController   # GET /test → "Hello World"
├── service/                    # 자리만 있음 (README)
├── repository/
├── entity/
├── dto/
└── config/
```

| Method | Path | 응답 |
|--------|------|------|
| `GET` | `/test` | `"Hello World"` |

### 4.5 실행

```bash
# 프로젝트 루트
./gradlew bootRun
```

- 사전 조건: 로컬 MySQL에 DB `restapi_crud` 생성, `application.properties` 계정과 일치
- URL: `http://localhost:8080`

---

## 5. Frontend

### 5.1 기본 정보

| 항목 | 값 |
|------|-----|
| 경로 | `frontend/` |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 빌드 | Vite 8 |
| HTTP | axios |
| 라우팅 | react-router-dom |

### 5.2 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 미리보기 |
| `npm run lint` | oxlint |

### 5.3 현재 상태

- Vite + React 기본 템플릿
- axios, react-router-dom 설치 완료
- CRUD UI / API 모듈 / 공통 타입 미구현

### 5.4 실행

```bash
cd frontend
npm install   # 최초 1회
npm run dev
```

- URL: `http://localhost:5173`

### 5.5 권장 프론트 구조 (구현 시)

```
frontend/src/
├── main.tsx
├── App.tsx
├── api/          # axios 인스턴스, API 함수
├── types/        # TypeScript 타입
├── components/   # 공통 컴포넌트
├── pages/        # 페이지 단위
└── hooks/        # 커스텀 훅 (선택)
```

Laravel의 `resources/views` + 일부 JS 대신, **페이지·컴포넌트·api 모듈**로 역할을 나눈다고 보면 된다.

---

## 6. Backend ↔ Frontend 연동

현재 CORS / Vite proxy 설정은 없다. 개발 시 아래 중 하나를 쓴다.

| 방식 | 설명 |
|------|------|
| Vite proxy (권장 후보) | `vite.config.ts`에서 `/api` → `http://localhost:8080` |
| CORS | Spring `config`에 `@CrossOrigin` 또는 `CorsConfiguration` |

권장 개발 흐름:

1. MySQL 기동, DB `restapi_crud` 생성  
2. Backend: `./gradlew bootRun`  
3. Frontend: `cd frontend && npm run dev`  
4. 브라우저에서 UI 확인, Network 탭으로 API 호출 확인  

---

## 7. 학습 중심 작업 순서

테이블 설계보다 **흐름 완성**을 우선한다.

```
(개념) 요청 흐름 이해
   ↓
Entity → Repository → DTO → Service → Controller
   ↓
CORS 또는 Vite proxy
   ↓
Frontend: api 모듈 → 목록/폼 페이지 → CRUD 연동
```

| 단계 | 백엔드 (Spring) | 프론트 (React) | Laravel 감각 |
|------|-----------------|----------------|--------------|
| 1 | Entity + Repository | - | Model + Eloquent |
| 2 | DTO + Service | - | Form Request + Service |
| 3 | Controller REST | - | `api.php` + Controller |
| 4 | CORS / 설정 | proxy 또는 baseURL | middleware / env |
| 5 | - | 목록·폼·삭제 UI | Blade 대신 SPA |

도메인 컬럼·테이블은 이 순서를 막지 않는 선에서 **나중에** 구체화한다.

---

## 8. 진행 상태

| 항목 | 상태 |
|------|------|
| 프로젝트명·패키지 `restapi_crud` 통일 | 완료 |
| Spring Boot + JPA + MySQL 설정 | 완료 |
| 계층 패키지 자리 (controller/service/…) | 완료 |
| 샘플 API `GET /test` | 완료 |
| React + TypeScript + Vite | 완료 |
| axios / react-router-dom | 완료 |
| 보험상품 도메인·테이블 확정 | 미정 |
| Entity / Repository / Service / DTO 구현 | 미구현 |
| CRUD REST API | 미구현 |
| Frontend CRUD UI | 미구현 |
| CORS 또는 Vite proxy | 미설정 |

---

## 9. 네이밍

| 구분 | 규칙 | 예시 |
|------|------|------|
| 프로젝트 / 앱 이름 | `restapi_crud` | `settings.gradle`, `spring.application.name` |
| Java 패키지 | `com.yama331.restapi_crud` | 백엔드 소스 전체 |
| 메인 클래스 | `RestapiCrudApplication` | 진입점 |
| DB 이름 | `restapi_crud` | MySQL schema |

> 과거 이름(`rest_api_practice`, `rest-api-practice`)은 사용하지 않는다.

---

## 10. 한 줄 정리

**보험상품 CRUD는 소재이고, 목표는 Laravel MVC 감각을 React + Spring Boot 분리 아키텍처로 옮기는 것.**  
스키마는 나중에, 계층·API·SPA 연동 완성 먼저.
