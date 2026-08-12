# 고객(Customer) CRUD 상세 설계서

| 항목 | 내용 |
|------|------|
| 문서 ID | `CUSTOMER-DESIGN` |
| 버전 | 1.0 |
| 상태 | 구현 가이드용 확정 |
| 관련 문서 | `CUSTOMER_MANUAL.md`, `PHASE1_DESIGN.md`, `PHASE1_MANUAL.md`, `CRUD_LEARNING_GUIDE.md` |
| 스택 | Java 21 · Spring Boot · JPA · MySQL · React 19 · TypeScript · Vite · axios · react-router-dom |

---

## 1. 문서 목적

보험상품 CRUD를 **한 바퀴 끝낸 뒤**, 같은 패턴을 **고객(Customer)** 도메인으로 다시 연습하기 위한 설계 고정 문서다.

읽는 사람:

- REST / Spring Boot / React 초보인 본인
- “보험상품 코드를 보고 고객을 복붙·변형” 할 때 기준이 필요할 때

**핵심 메시지**

> 새 기술을 배우는 것이 아니다.  
> **이미 한 번 한 흐름을 다른 테이블·다른 화면으로 한 번 더 그리는 연습**이다.

---

## 2. 배경과 목표

### 2.1 배경 (As-Is)

| 영역 | 현재 상태 |
|------|-----------|
| 보험상품 백엔드 CRUD | 완료 |
| 보험상품 프론트 CRUD | 완료 (목록·등록·수정·삭제) |
| 고객 테이블 / API / 화면 | **없음 (이번에 만듦)** |
| 상품 ↔ 고객 연관관계 | **없음 (의도적 제외)** |

### 2.2 목표 (To-Be)

| 기능 | 코드 | 설명 |
|------|------|------|
| 생성 | **C**reate | 고객 등록 폼 → DB 저장 → 목록 표시 |
| 조회 | **R**ead | 목록 + 수정 화면 진입 시 단건 |
| 수정 | **U**pdate | 기존 값 로드 → 수정 → 목록 반영 |
| 삭제 | **D**elete | 확인 후 삭제 → 목록에서 제거 |

### 2.3 성공 기준

1. Postman으로 ` /api/customers ` C/R/U/D 모두 동작  
2. 브라우저 `http://localhost:5173/customers` 에서 Postman 없이 C/R/U/D 가능  
3. 등록 **201**, 수정 **200**, 삭제 **204**, 목록/단건 **200**  
4. 로딩·에러 메시지 표시  
5. 기존 보험상품 기능이 **깨지지 않음**  
6. 로그인·권한·계약(상품-고객 연결) 코드 **포함하지 않음**

### 2.4 비목표 (Out of Scope)

| 제외 | 이유 |
|------|------|
| 고객 ↔ 보험상품 연결(계약) | 다음 연습 소재 |
| 로그인 / 권한 | 별도 단계 |
| 이메일 중복 검증(DB unique) | 1차 연습 후 선택 |
| 페이지네이션·검색 | 기본 CRUD 이후 |
| 예쁜 UI | 동작 우선 |

---

## 3. 왜 “고객”인가?

| 이유 | 설명 |
|------|------|
| 독립 도메인 | 상품 테이블을 안 건드려도 됨 → 위험 적음 |
| 필드가 단순 | 이름·연락처 위주 → 개념에 집중 |
| 패턴 동일 | Entity → Repository → DTO → Service → Controller → React |
| 다음 확장 | 나중에 **계약** 만들 때 “누가 가입했나”의 주체가 됨 |

보험상품 파일과 **1:1로 대응**시키면 학습이 쉽다.

| 보험상품 | 고객 |
|----------|------|
| `InsuranceProduct` | `Customer` |
| `insurance_products` | `customers` |
| `/api/insurance-products` | `/api/customers` |
| `/products/...` 화면 | `/customers/...` 화면 |

---

## 4. 시스템 구성 (복습)

```
┌──────────────┐     HTTP JSON      ┌──────────────────┐     JPA      ┌─────────┐
│  Browser     │ ─────────────────▶ │  Spring Boot     │ ──────────▶ │  MySQL  │
│  React SPA   │ ◀───────────────── │  :8080           │ ◀────────── │         │
│  :5173       │   CORS 이미 설정됨  │  REST API        │             │restapi_ │
└──────────────┘                    └──────────────────┘             │  _crud  │
                                                                     └─────────┘
```

**고객 요청 한 건의 백엔드 흐름**

```
브라우저/Postman
      │  JSON
      ▼
CustomerController   ← URL, HTTP 메서드, 상태 코드
      │  DTO
      ▼
CustomerService      ← 저장·조회·수정·삭제 로직, Entity ↔ DTO
      │
      ▼
CustomerRepository   ← JPA (save, findAll, findById, deleteById …)
      │
      ▼
Customer Entity  ↔  테이블 customers
```

프론트:

```
pages/Customer*.tsx   화면
      │
api/customerApi.ts    axios 호출
      │
types/customer.ts     Request / Response 타입
```

---

## 5. 데이터베이스 설계

### 5.1 테이블: `customers`

**설명**: 보험사에 등록된 **고객 1명 = 1행**.  
(상품과의 연결은 아직 없다. 고객 마스터만.)

| # | 컬럼명 (DB) | Java 필드 | 타입 (MySQL) | NULL | 기본값 | 설명 |
|---|-------------|-----------|--------------|------|--------|------|
| 1 | `id` | `id` | `BIGINT` PK AI | NO | AUTO_INCREMENT | 기본키 |
| 2 | `name` | `name` | `VARCHAR(50)` | NO | — | 고객 이름 |
| 3 | `email` | `email` | `VARCHAR(100)` | NO | — | 이메일 |
| 4 | `phone` | `phone` | `VARCHAR(20)` | NO | — | 연락처 |
| 5 | `birth_date` | `birthDate` | `DATE` | YES | NULL | 생년월일 (선택) |
| 6 | `address` | `address` | `VARCHAR(200)` | YES | NULL | 주소 (선택) |
| 7 | `status` | `status` | `VARCHAR(10)` | NO | `'활성'` | 활성 / 비활성 |
| 8 | `created_at` | `createdAt` | `DATETIME` | YES* | 자동 | 생성 시각 |
| 9 | `updated_at` | `updatedAt` | `DATETIME` | YES* | 자동 | 수정 시각 |

\* `@CreationTimestamp` / `@UpdateTimestamp` 가 채움.

### 5.2 샘플 데이터 (머릿속용)

| id | name | email | phone | status |
|----|------|-------|-------|--------|
| 1 | 김민수 | minsu@example.com | 010-1111-2222 | 활성 |
| 2 | 이서연 | seoyeon@example.com | 010-3333-4444 | 활성 |

### 5.3 테이블 생성 방식

보험상품과 동일:

- `application.properties` 의 `spring.jpa.hibernate.ddl-auto=update`
- `Customer` Entity 를 만들고 앱을 재시작하면 **테이블 자동 생성/갱신**
- 손으로 `CREATE TABLE` 안 해도 됨 (학습 단계)

---

## 6. REST API 설계

### 6.1 공통 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| REST 경로 | kebab-case 복수형 | `/api/customers` |
| JSON 필드 | camelCase | `birthDate`, `createdAt` |
| 등록 성공 | **201 Created** | body에 저장된 고객 |
| 조회/수정 성공 | **200 OK** | body에 데이터 |
| 삭제 성공 | **204 No Content** | body 없음 |
| 없는 id | 예외 (학습용 `IllegalArgumentException`) | 나중에 404 정리 가능 |

### 6.2 엔드포인트 목록

| ID | Method | URL | 설명 | 성공 코드 |
|----|--------|-----|------|-----------|
| C-01 | `POST` | `/api/customers` | 등록 | **201** |
| C-02 | `GET` | `/api/customers` | 전체 목록 | **200** |
| C-03 | `GET` | `/api/customers/{id}` | 단건 조회 | **200** |
| C-04 | `PUT` | `/api/customers/{id}` | 수정 | **200** |
| C-05 | `DELETE` | `/api/customers/{id}` | 삭제 | **204** |

### 6.3 Request DTO — `CustomerRequest`

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `name` | string | ✅ | 고객 이름 |
| `email` | string | ✅ | 이메일 |
| `phone` | string | ✅ | 연락처 |
| `birthDate` | string (날짜) | ❌ | `YYYY-MM-DD` (JSON → `LocalDate`) |
| `address` | string | ❌ | 주소 |
| `status` | string | ❌ | 안 보내면 기본값 `"활성"` |

**등록 예시 JSON**

```json
{
  "name": "김민수",
  "email": "minsu@example.com",
  "phone": "010-1111-2222",
  "birthDate": "1990-05-15",
  "address": "서울시 강남구",
  "status": "활성"
}
```

### 6.4 Response DTO — `CustomerResponse`

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | number | 기본키 |
| `name` | string | 이름 |
| `email` | string | 이메일 |
| `phone` | string | 연락처 |
| `birthDate` | string \| null | `YYYY-MM-DD` |
| `address` | string \| null | 주소 |
| `status` | string | 상태 |
| `createdAt` | string | 생성 시각 |
| `updatedAt` | string | 수정 시각 |

**응답 예시**

```json
{
  "id": 1,
  "name": "김민수",
  "email": "minsu@example.com",
  "phone": "010-1111-2222",
  "birthDate": "1990-05-15",
  "address": "서울시 강남구",
  "status": "활성",
  "createdAt": "2026-08-12T10:00:00",
  "updatedAt": "2026-08-12T10:00:00"
}
```

---

## 7. 백엔드 파일 맵 (만들 파일)

보험상품과 **같은 패키지 구조**, 이름만 고객으로.

| 계층 | 경로 (패키지 기준 `com.yama331.restapi_crud`) |
|------|-----------------------------------------------|
| Entity | `entity/Customer.java` |
| Repository | `repository/CustomerRepository.java` |
| Request DTO | `dto/CustomerRequest.java` |
| Response DTO | `dto/CustomerResponse.java` |
| Service | `service/CustomerService.java` |
| Controller | `controller/CustomerController.java` |

**만드는 순서 (중요)**

```
1. Entity        ← DB 모양 결정
2. Repository    ← DB 접근 도구
3. Request/Response DTO
4. Service       ← 비즈니스 로직
5. Controller    ← HTTP 입구
6. Postman 검증  ← 프론트 전에 꼭!
7. 프론트 types / api / pages / router
```

---

## 8. 프론트엔드 설계

### 8.1 파일 맵

| 역할 | 경로 |
|------|------|
| 타입 | `frontend/src/types/customer.ts` |
| API 함수 | `frontend/src/api/customerApi.ts` |
| 목록 | `frontend/src/pages/CustomerList.tsx` |
| 등록 | `frontend/src/pages/CustomerCreate.tsx` |
| 수정 | `frontend/src/pages/CustomerEdit.tsx` |
| 라우터 | `frontend/src/App.tsx` (Route 추가) |

`axios.ts` 는 **수정 불필요** (baseURL 이미 `http://localhost:8080`).  
`WebConfig` CORS 도 **수정 불필요**.

### 8.2 화면 URL

| URL | 화면 |
|-----|------|
| `/customers` | 고객 목록 |
| `/customers/new` | 고객 등록 |
| `/customers/:id/edit` | 고객 수정 |

기존 상품:

| URL | 화면 |
|-----|------|
| `/` | 상품 목록 (유지) |
| `/products/new` | 상품 등록 (유지) |
| `/products/:id/edit` | 상품 수정 (유지) |

### 8.3 목록 ↔ 등록/수정 네비게이션

- 상품 목록에 **「고객 관리」** 링크 → `/customers`
- 고객 목록에 **「상품 목록」** 링크 → `/`
- 고객 목록에 **「고객 등록」** → `/customers/new`
- 각 행 **수정** → `/customers/{id}/edit`, **삭제** → DELETE API

---

## 9. 날짜 필드 주의 (초보 함정)

| 위치 | 타입 |
|------|------|
| DB | `DATE` |
| Java Entity | `LocalDate` |
| JSON | `"1990-05-15"` 문자열 |
| React input `type="date"` | 문자열 `"YYYY-MM-DD"` |
| TypeScript | `string \| null` (응답), 요청은 `string` 선택 |

Spring Boot 기본 Jackson 설정이면  
`"birthDate": "1990-05-15"` ↔ `LocalDate` 자동 변환이 된다.  
**프론트에서 Date 객체로 복잡하게 안 바꿔도 된다.** 문자열 그대로 주고받는 것이 초보에게 안전하다.

---

## 10. 구현 순서 요약 (매뉴얼과 동일)

| Work | 내용 | 예상 |
|------|------|------|
| 0 | 환경 (MySQL, bootRun, npm run dev) | 10분 |
| 1 | Entity + Repository | 20~30분 |
| 2 | DTO (Request / Response) | 15~20분 |
| 3 | Service | 25~40분 |
| 4 | Controller | 20~30분 |
| 5 | Postman 전체 검증 | 20분 |
| 6 | 프론트 types + api | 20분 |
| 7 | 라우터 + 빈 페이지 | 20분 |
| 8 | 목록 (Read + Delete) | 40분 |
| 9 | 등록 (Create) | 40분 |
| 10 | 수정 (Update) | 40분 |
| 11 | E2E 최종 체크 | 15분 |

상세 코드·주석·해설은 **`docs/CUSTOMER_MANUAL.md`** 를 따른다.

---

## 11. 보험상품과 비교 체크리스트 (구현 후)

| 항목 | 상품 | 고객 | 완료 |
|------|------|------|------|
| Entity | InsuranceProduct | Customer | ☐ |
| Repository | …Repository | CustomerRepository | ☐ |
| Request/Response DTO | 있음 | 있음 | ☐ |
| Service CRUD 5개 | 있음 | 있음 | ☐ |
| Controller 5 엔드포인트 | 있음 | 있음 | ☐ |
| Postman 통과 | 있음 | ☐ | ☐ |
| types + api | 있음 | ☐ | ☐ |
| List / Create / Edit | 있음 | ☐ | ☐ |
| App.tsx Route | `/products/...` | `/customers/...` | ☐ |

전부 체크되면 **고객 CRUD 한 바퀴 완료**.
