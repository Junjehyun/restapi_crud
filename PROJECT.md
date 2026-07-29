# restapi_crud

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | `restapi_crud` |
| 목적 | REST API 기반 CRUD 연습 프로젝트 |
| 아키텍처 | Backend / Frontend 분리 (Monorepo) |
| Backend | Java 21 + Spring Boot 4.1 + Spring Data JPA |
| Frontend | React 19 + TypeScript + Vite |
| Database | MySQL |
| 통신 방식 | REST API (JSON) |

### 기술 스택 요약

```
[ Browser ]
     │  HTTP (axios)
     ▼
[ React + TypeScript (Vite) ]  ← frontend/  (기본 포트: 5173)
     │  REST API
     ▼
[ Spring Boot (Web MVC) ]      ← 루트 src/  (기본 포트: 8080)
     │  JPA / Hibernate
     ▼
[ MySQL ]                      ← DB: restapi_crud
```

---

## 2. 디렉터리 구조

```
restapi_crud/
├── build.gradle                 # Backend 의존성·빌드 설정
├── settings.gradle              # 프로젝트명: restapi_crud
├── gradlew / gradlew.bat        # Gradle Wrapper
├── gradle/wrapper/              # Gradle Wrapper 설정
├── HELP.md                      # Spring Initializr 참고 문서
├── PROJECT.md                   # 본 문서 (구조·개요)
│
├── src/                         # ===== Backend (Spring Boot) =====
│   ├── main/
│   │   ├── java/com/yama331/restapi_crud/
│   │   │   ├── RestapiCrudApplication.java   # 애플리케이션 진입점
│   │   │   └── controller/
│   │   │       └── MainController.java       # 샘플 REST Controller
│   │   └── resources/
│   │       └── application.properties        # DB·JPA 설정
│   └── test/
│       └── java/com/yama331/restapi_crud/
│           └── RestapiCrudApplicationTests.java
│
└── frontend/                    # ===== Frontend (React + TS) =====
    ├── package.json             # 의존성·스크립트
    ├── vite.config.ts           # Vite 설정
    ├── tsconfig*.json           # TypeScript 설정
    ├── index.html
    ├── public/                  # 정적 리소스
    └── src/
        ├── main.tsx             # React 진입점
        ├── App.tsx              # 루트 컴포넌트 (Vite 기본 템플릿)
        ├── App.css / index.css
        └── assets/
```

---

## 3. Backend 개요

### 3.1 기본 정보

| 항목 | 값 |
|------|-----|
| Group | `com.yama331` |
| Package | `com.yama331.restapi_crud` |
| Main Class | `RestapiCrudApplication` |
| Java | 21 |
| Build | Gradle |
| Spring Boot | 4.1.0 |

### 3.2 주요 의존성 (`build.gradle`)

| 의존성 | 용도 |
|--------|------|
| `spring-boot-starter-webmvc` | REST API (Spring MVC) |
| `spring-boot-starter-data-jpa` | JPA / Hibernate |
| `mysql-connector-j` | MySQL 드라이버 |
| `lombok` | 보일러플레이트 코드 감소 |
| `spring-boot-devtools` | 개발 시 자동 재시작 |

### 3.3 설정 (`application.properties`)

| 키 | 설명 |
|----|------|
| `spring.application.name` | `restapi_crud` |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/restapi_crud` |
| `spring.jpa.hibernate.ddl-auto` | `update` (엔티티 기준 스키마 자동 반영) |
| `spring.jpa.show-sql` | `true` (SQL 로그 출력) |

### 3.4 현재 패키지 구성

```
com.yama331.restapi_crud
├── RestapiCrudApplication   # @SpringBootApplication
└── controller
    └── MainController       # GET /test → "Hello World"
```

> **참고:** Entity / Repository / Service / DTO 계층은 아직 구성 전이며, CRUD 구현 시 추가 예정.

### 3.5 샘플 API

| Method | Path | 응답 |
|--------|------|------|
| `GET` | `/test` | `"Hello World"` |

### 3.6 실행 방법

```bash
# 프로젝트 루트에서
./gradlew bootRun
```

- 사전 조건: 로컬 MySQL에 DB `restapi_crud` 생성, `application.properties`의 계정 정보와 일치
- 기본 URL: `http://localhost:8080`

---

## 4. Frontend 개요

### 4.1 기본 정보

| 항목 | 값 |
|------|-----|
| 경로 | `frontend/` |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 빌드 도구 | Vite 8 |
| HTTP 클라이언트 | axios |
| 라우팅 | react-router-dom |

### 4.2 주요 스크립트 (`package.json`)

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | oxlint 실행 |

### 4.3 현재 상태

- Vite + React 기본 템플릿 상태
- axios, react-router-dom 설치 완료 (API 연동·페이지 라우팅 준비)
- CRUD UI, API 모듈, 공통 타입 등은 미구현

### 4.4 실행 방법

```bash
cd frontend
npm install   # 최초 1회
npm run dev
```

- 기본 URL: `http://localhost:5173`

---

## 5. Backend ↔ Frontend 연동 (예정)

현재는 CORS / Vite proxy 설정이 없습니다. 개발 시 아래 중 하나를 권장합니다.

| 방식 | 설명 |
|------|------|
| Vite proxy | `vite.config.ts`에서 `/api` → `http://localhost:8080` 프록시 |
| CORS | Spring에 `@CrossOrigin` 또는 `CorsConfiguration` 설정 |

권장 개발 흐름:

1. MySQL 기동 및 DB `restapi_crud` 생성  
2. Backend: `./gradlew bootRun`  
3. Frontend: `cd frontend && npm run dev`  
4. 브라우저에서 UI 확인, Network 탭으로 API 호출 확인  

---

## 6. 향후 CRUD 구현 시 권장 구조

### Backend

```
com.yama331.restapi_crud
├── RestapiCrudApplication
├── controller/          # REST 엔드포인트
├── service/             # 비즈니스 로직
├── repository/          # JPA Repository
├── entity/              # JPA Entity
├── dto/                 # 요청/응답 DTO
└── config/              # CORS 등 설정
```

### Frontend

```
frontend/src/
├── main.tsx
├── App.tsx
├── api/                 # axios 인스턴스, API 함수
├── types/               # TypeScript 타입
├── components/          # 공통/재사용 컴포넌트
├── pages/               # 페이지 단위 컴포넌트
└── hooks/               # 커스텀 훅 (선택)
```

---

## 7. 현재 진행 상태 체크리스트

| 항목 | 상태 |
|------|------|
| 프로젝트명·패키지 `restapi_crud` 통일 | 완료 |
| Spring Boot + JPA + MySQL 설정 | 완료 |
| 샘플 Controller (`GET /test`) | 완료 |
| React + TypeScript + Vite 스캐폴딩 | 완료 |
| axios / react-router-dom 설치 | 완료 |
| Entity / Repository / Service | 미구현 |
| CRUD REST API | 미구현 |
| Frontend CRUD UI | 미구현 |
| CORS 또는 Vite proxy | 미설정 |

---

## 8. 네이밍 규칙

| 구분 | 규칙 | 예시 |
|------|------|------|
| 프로젝트 / 앱 이름 | `restapi_crud` | `settings.gradle`, `spring.application.name` |
| Java 패키지 | `com.yama331.restapi_crud` | 모든 백엔드 소스 |
| Java 메인 클래스 | `RestapiCrudApplication` | 진입점 |
| DB 이름 | `restapi_crud` | MySQL schema |

> 과거 이름(`rest_api_practice`, `rest-api-practice`)은 사용하지 않습니다.
