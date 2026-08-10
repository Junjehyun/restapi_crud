# 1단계 상세 설계서  
## 보험상품 Frontend CRUD 완성

| 항목 | 내용 |
|------|------|
| 문서 ID | `PHASE1-DESIGN` |
| 버전 | 1.0 |
| 상태 | 확정 (구현 가이드용) |
| 대상 단계 | 로드맵 **1단계** (`ROADMAP_3PHASE.md`) |
| 관련 문서 | `PROJECT.md`, `CRUD_LEARNING_GUIDE.md`, `ROADMAP_3PHASE.md` |
| 스택 | Java 21 · Spring Boot · JPA · MySQL · React 19 · TypeScript · Vite · axios · react-router-dom |

---

## 1. 문서 목적

이 문서는 1단계에서 **무엇을 만들지, 데이터가 어떻게 생겼는지, 화면·API가 어떻게 흐르는지, 어떤 순서로 학습·구현할지** 를 설계서 형식으로 고정한다.

읽는 사람:

- 이 프로젝트를 처음 이어서 하는 본인 (초보 기준)
- 나중에 2·3단계 들어가기 전 “1단계 범위”를 다시 확인할 때

---

## 2. 배경과 목표

### 2.1 배경 (As-Is)

| 영역 | 현재 상태 |
|------|-----------|
| DB `insurance_products` | Entity 기준 스키마 존재 (`ddl-auto=update`) |
| Backend REST CRUD | **구현 완료** (POST/GET/PUT/DELETE) |
| CORS | `http://localhost:5173` 허용 |
| Frontend 타입·API 모듈 | 존재 (등록 path 소수정 필요) |
| Frontend 화면 | **목록(Read)만** 구현 |
| 인증 | 없음 (1단계 범위 밖) |

### 2.2 목표 (To-Be)

브라우저만으로 보험상품에 대해 아래를 수행한다.

| 기능 | 코드 | 설명 |
|------|------|------|
| 생성 | **C**reate | 등록 폼 → DB 저장 → 목록에 표시 |
| 조회 | **R**ead | 목록 조회 (단건은 수정 화면 진입 시 사용) |
| 수정 | **U**pdate | 기존 값 로드 → 수정 → 목록 반영 |
| 삭제 | **D**elete | 확인 후 삭제 → 목록에서 제거 |

### 2.3 성공 기준 (Acceptance Criteria)

1. `http://localhost:5173` 에서 Postman 없이 C/R/U/D 가능  
2. 등록 성공 시 HTTP **201**, 목록에 새 행 표시  
3. 수정 성공 시 HTTP **200**, 변경 값 목록 반영  
4. 삭제 성공 시 HTTP **204**, 해당 행 목록에서 사라짐  
5. 로딩 중 UI 표시, API 실패 시 에러 메시지 표시  
6. 1단계 범위에 User/로그인/주문 코드가 **포함되지 않음**

### 2.4 비목표 (Out of Scope)

| 제외 항목 | 이유 |
|-----------|------|
| 회원가입 / 로그인 / 권한 | **2단계** |
| 주문·구매 | **3단계** |
| 검색·정렬·페이지네이션 | 1차 CRUD 이후 선택 |
| 파일 업로드, 이미지 | 불필요 |
| 예쁜 디자인 시스템 | 동작 우선 (기본 HTML/CSS로 충분) |
| 다국어, 감사 로그 | 범위 밖 |

---

## 3. 시스템 구성

### 3.1 런타임 구성도

```
┌──────────────┐     HTTP JSON      ┌──────────────────┐     JPA      ┌─────────┐
│  Browser     │ ─────────────────▶ │  Spring Boot     │ ──────────▶ │  MySQL  │
│  React SPA   │ ◀───────────────── │  :8080           │ ◀────────── │         │
│  :5173       │   CORS 허용됨       │  REST API        │             │restapi_ │
└──────────────┘                    └──────────────────┘             │  _crud  │
                                                                     └─────────┘
```

| 구성요소 | 포트 | 역할 |
|----------|------|------|
| Frontend (Vite + React) | 5173 | 화면, 폼, 라우팅, axios 호출 |
| Backend (Spring Boot) | 8080 | REST API, 비즈니스 로직, DB 접근 |
| MySQL | 3306 | `restapi_crud` 스키마 |

### 3.2 백엔드 계층 (이미 구현됨 — 1단계에서 유지)

```
요청 JSON
   │
   ▼
Controller  (URL, HTTP 메서드, 상태 코드)
   │  DTO
   ▼
Service     (CRUD 로직, Entity ↔ DTO)
   │
   ▼
Repository  (JPA)
   │
   ▼
Entity / Table  insurance_products
```

**1단계 원칙**: 백엔드 계층을 크게 바꾸지 않는다.  
프론트가 이 API를 **소비**하는 것이 핵심 학습이다.

### 3.3 프론트엔드 계층 (1단계에서 완성)

```
pages/          화면 (목록, 등록, 수정)
   │
api/            axios 호출 함수 (백엔드 URL 1:1)
   │
types/          Request / Response 타입 (DTO 대응)
```

---

## 4. 데이터베이스 설계

### 4.1 테이블 목록 (1단계)

| 테이블명 | 용도 | 1단계 |
|----------|------|-------|
| `insurance_products` | 보험 상품 마스터 | **사용 (유일)** |

> `users`, `orders` 는 2·3단계. 1단계 설계·구현에 포함하지 않는다.

### 4.2 테이블 정의: `insurance_products`

**설명**: 보험 상품 1건 = 1행. 관리 화면에서 등록·수정·삭제 대상.

| # | 컬럼명 (DB) | Java 필드 | 타입 (MySQL) | NULL | 기본값 | 설명 |
|---|-------------|-----------|--------------|------|--------|------|
| 1 | `id` | `id` | `BIGINT` PK AI | NO | AUTO_INCREMENT | 기본키 |
| 2 | `name` | `name` | `VARCHAR(100)` | NO | — | 상품명 |
| 3 | `company` | `company` | `VARCHAR(50)` | NO | — | 보험사명 |
| 4 | `type` | `type` | `VARCHAR(30)` | NO | — | 상품 유형 (종신, 실손, 자동차, 연금 등) |
| 5 | `monthly_premium` | `monthlyPremium` | `DECIMAL(10,0)` | NO | — | 월 보험료 (원, 정수) |
| 6 | `description` | `description` | `TEXT` | YES | NULL | 상품 설명 |
| 7 | `status` | `status` | `VARCHAR(10)` | NO | `'판매중'` | 판매 상태 |
| 8 | `created_at` | `createdAt` | `DATETIME` | YES* | 저장 시 자동 | 생성 시각 |
| 9 | `updated_at` | `updatedAt` | `DATETIME` | YES* | 저장/수정 시 자동 | 수정 시각 |

\* JPA `@CreationTimestamp` / `@UpdateTimestamp` 가 채움. 애플리케이션이 INSERT/UPDATE 할 때 설정.

#### 제약 조건

| 제약 | 내용 |
|------|------|
| PRIMARY KEY | `id` |
| NOT NULL | `name`, `company`, `type`, `monthly_premium`, `status` |
| 길이 | name≤100, company≤50, type≤30, status≤10 |
| 금액 | `DECIMAL(10,0)` — 소수 없음, 최대 10자리 정수 |

#### 상태(`status`) 허용 값 (애플리케이션 규칙)

| 값 | 의미 | 1단계 처리 |
|----|------|------------|
| `판매중` | 판매 가능 (기본) | 등록 시 미입력 → 서버 기본값 |
| `판매중지` | 판매 중단 | 폼 select로 선택 가능 |
| `준비중` | 출시 전 | 폼 select로 선택 가능 |

> DB ENUM 강제까지는 1단계에서 필수 아님. 문자열 + 프론트 select 로 충분.

#### 명명 규칙

| 계층 | 규칙 | 예 |
|------|------|-----|
| DB 컬럼 | snake_case | `monthly_premium` |
| Java / JSON | camelCase | `monthlyPremium` |
| REST 경로 | kebab-case 복수형 | `/api/insurance-products` |

#### 인덱스 (1단계)

| 인덱스 | 필수? | 비고 |
|--------|-------|------|
| PK `id` | ✅ | 자동 |
| 기타 검색용 인덱스 | ❌ | 검색 기능 없음 |

#### 샘플 데이터 (수동 등록 예시)

| id | name | company | type | monthly_premium | description | status |
|----|------|---------|------|-----------------|-------------|--------|
| 1 | 든든종신보험 | 삼성생명 | 종신 | 85000 | 평생 보장 연습 상품 | 판매중 |
| 2 | 실속실손 | 한화손보 | 실손 | 32000 | NULL | 판매중 |

---

## 5. API 설계 (계약)

베이스 URL: `http://localhost:8080`  
공통 Content-Type: `application/json`

### 5.1 엔드포인트 요약

| ID | Method | Path | 설명 | 성공 코드 | 인증(1단계) |
|----|--------|------|------|-----------|-------------|
| P-01 | `POST` | `/api/insurance-products` | 등록 | **201** | 없음 |
| P-02 | `GET` | `/api/insurance-products` | 전체 목록 | **200** | 없음 |
| P-03 | `GET` | `/api/insurance-products/{id}` | 단건 조회 | **200** | 없음 |
| P-04 | `PUT` | `/api/insurance-products/{id}` | 수정 | **200** | 없음 |
| P-05 | `DELETE` | `/api/insurance-products/{id}` | 삭제 | **204** | 없음 |

### 5.2 요청 DTO — `InsuranceProductRequest`

등록(P-01)·수정(P-04) body.

| JSON 필드 | 타입 | 필수 | 설명 | 대응 DB |
|-----------|------|------|------|---------|
| `name` | string | ✅ | 상품명 | `name` |
| `company` | string | ✅ | 보험사 | `company` |
| `type` | string | ✅ | 유형 | `type` |
| `monthlyPremium` | number | ✅ | 월 보험료 | `monthly_premium` |
| `description` | string | ❌ | 설명 | `description` |
| `status` | string | ❌ | 상태. 없으면 서버 기본 `판매중` | `status` |

**포함하지 않는 필드**: `id`, `createdAt`, `updatedAt` (서버 생성)

#### 요청 예시 (등록)

```json
{
  "name": "든든종신보험",
  "company": "삼성생명",
  "type": "종신",
  "monthlyPremium": 85000,
  "description": "평생 보장 연습 상품",
  "status": "판매중"
}
```

### 5.3 응답 DTO — `InsuranceProductResponse`

| JSON 필드 | 타입 | 설명 |
|-----------|------|------|
| `id` | number | PK |
| `name` | string | 상품명 |
| `company` | string | 보험사 |
| `type` | string | 유형 |
| `monthlyPremium` | number | 월 보험료 |
| `description` | string \| null | 설명 |
| `status` | string | 상태 |
| `createdAt` | string (ISO-8601) | 생성 시각 |
| `updatedAt` | string (ISO-8601) | 수정 시각 |

#### 응답 예시 (단건 / 등록·수정 결과)

```json
{
  "id": 1,
  "name": "든든종신보험",
  "company": "삼성생명",
  "type": "종신",
  "monthlyPremium": 85000,
  "description": "평생 보장 연습 상품",
  "status": "판매중",
  "createdAt": "2026-08-07T10:00:00",
  "updatedAt": "2026-08-07T10:00:00"
}
```

#### 목록 응답 (P-02)

```json
[
  { "id": 1, "name": "...", "...": "..." },
  { "id": 2, "name": "...", "...": "..." }
]
```

빈 목록: `[]` (200 OK)

### 5.4 엔드포인트별 상세

#### P-01 등록

| 항목 | 내용 |
|------|------|
| Request body | `InsuranceProductRequest` |
| 성공 | `201 Created` + `InsuranceProductResponse` |
| 비고 | `status` 생략 시 서버에서 `"판매중"` |

#### P-02 전체 조회

| 항목 | 내용 |
|------|------|
| Request body | 없음 |
| 성공 | `200 OK` + `InsuranceProductResponse[]` |
| 프론트 사용처 | 목록 페이지 마운트 시 |

#### P-03 단건 조회

| 항목 | 내용 |
|------|------|
| Path | `id` (Long) |
| 성공 | `200 OK` + `InsuranceProductResponse` |
| 실패(현재) | 없으면 `IllegalArgumentException` → 대개 500 (개선 시 404 권장) |
| 프론트 사용처 | 수정 페이지 진입 시 폼 초기값 |

#### P-04 수정

| 항목 | 내용 |
|------|------|
| Path | `id` |
| Request body | `InsuranceProductRequest` |
| 성공 | `200 OK` + 수정된 `InsuranceProductResponse` |
| 서버 동작 | 존재 확인 → 필드 덮어쓰기 (더티 체킹). `status`는 null이 아닐 때만 변경 |
| 비고 | `createdAt` 유지, `updatedAt` 자동 갱신 |

#### P-05 삭제

| 항목 | 내용 |
|------|------|
| Path | `id` |
| 성공 | `204 No Content` (body 없음) |
| 실패(현재) | 없으면 예외 (개선 시 404 권장) |

### 5.5 프론트 API 모듈 매핑

파일: `frontend/src/api/insuranceProductApi.ts`

| 함수 | Method | Path | 비고 |
|------|--------|------|------|
| `createInsuranceProduct` | POST | `/api/insurance-products` | path 앞에 **`/` 필수** |
| `getInsuranceProducts` | GET | `/api/insurance-products` | |
| `getInsuranceProduct` | GET | `/api/insurance-products/{id}` | |
| `updateInsuranceProduct` | PUT | `/api/insurance-products/{id}` | |
| `deleteInsuranceProduct` | DELETE | `/api/insurance-products/{id}` | |

axios `baseURL`: `http://localhost:8080` (`api/axios.ts`)

---

## 6. 화면 설계

### 6.1 사이트맵 · 라우팅

| 경로 | 페이지 이름 | 파일 (권장) | 주요 동작 |
|------|-------------|-------------|-----------|
| `/` | 상품 목록 | `InsuranceProductList.tsx` | 목록, 삭제, 등록/수정 링크 |
| `/products/new` | 상품 등록 | `InsuranceProductCreate.tsx` | 등록 폼 |
| `/products/:id/edit` | 상품 수정 | `InsuranceProductEdit.tsx` | 단건 로드 + 수정 폼 |

라우터: `react-router-dom` (`BrowserRouter` + `Routes` + `Route`)  
설정: `App.tsx`

### 6.2 화면별 UI 요소

#### S-01 목록 (`/`)

| 영역 | 요소 | 동작 |
|------|------|------|
| 헤더 | 제목 “보험 상품 목록” | — |
| 헤더 | 버튼 “상품 등록” | `navigate('/products/new')` 또는 `<Link>` |
| 본문 | 로딩 문구 | `loading === true` |
| 본문 | 에러 문구 | `error !== null` |
| 본문 | 빈 목록 안내 | `products.length === 0` |
| 표 | 컬럼 | 아래 표 참고 |
| 행 액션 | “수정” | `/products/{id}/edit` |
| 행 액션 | “삭제” | confirm → DELETE → 목록 재조회 |

**테이블 표시 컬럼**

| 화면 컬럼 | 데이터 필드 | 표시 형식 |
|-----------|-------------|-----------|
| ID | `id` | 숫자 |
| 상품명 | `name` | 텍스트 |
| 보험사 | `company` | 텍스트 |
| 유형 | `type` | 텍스트 |
| 월보험료 | `monthlyPremium` | `toLocaleString()` + `원` |
| 상태 | `status` | 텍스트 |
| 관리 | — | 수정 / 삭제 버튼 |

(선택) `createdAt` 컬럼 — 1단계 필수는 아님.

#### S-02 등록 (`/products/new`)

| 필드 라벨 | name | input | 필수 | 비고 |
|-----------|------|-------|------|------|
| 상품명 | `name` | text | ✅ | max 느낌 100 |
| 보험사 | `company` | text | ✅ | |
| 유형 | `type` | text 또는 select | ✅ | 예: 종신/실손/자동차/연금 |
| 월 보험료 | `monthlyPremium` | number | ✅ | 0 이상 정수 권장 |
| 설명 | `description` | textarea | ❌ | |
| 상태 | `status` | select | ❌ | 기본 `판매중` |

| 버튼 | 동작 |
|------|------|
| 등록 | validation → POST → 성공 시 `/` |
| 취소 | `/` 로 이동 (API 호출 없음) |

#### S-03 수정 (`/products/:id/edit`)

- 폼 필드는 등록과 **동일**  
- 진입 시 `GET /api/insurance-products/{id}` 로 값 채움  
- 제출 시 `PUT /api/insurance-products/{id}`  
- 성공 시 `/`  

| 추가 UI | 설명 |
|---------|------|
| 로딩(초기) | 단건 조회 중 |
| 에러(초기) | 없는 id 등 조회 실패 |
| id 표시 | 읽기 전용으로 id 보여 주면 디버깅에 유리 (선택) |

### 6.3 디렉터리 구조 (1단계 목표)

```
frontend/src/
├── main.tsx
├── App.tsx                          # Router 정의
├── api/
│   ├── axios.ts                     # baseURL
│   └── insuranceProductApi.ts       # CRUD 함수
├── types/
│   └── insuranceProduct.ts          # Request / Response
└── pages/
    ├── InsuranceProductList.tsx     # S-01 (기존 + 버튼)
    ├── InsuranceProductCreate.tsx   # S-02 (신규)
    └── InsuranceProductEdit.tsx     # S-03 (신규)
```

공통 폼을 `components/InsuranceProductForm.tsx` 로 빼는 것은 **선택**.  
초보는 Create/Edit 분리 후, 익숙해지면 통합 권장.

---

## 7. 플로우 설계

### 7.1 전체 유스케이스 맵

```
                    ┌─────────────┐
                    │  목록 (R)   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ 등록 (C) │   │ 수정 (U) │   │ 삭제 (D) │
     └────┬─────┘   └────┬─────┘   └────┬─────┘
          │              │              │
          └──────────────┴──────────────┘
                         │
                         ▼
                   목록으로 복귀/갱신
```

### 7.2 시퀀스: 목록 조회 (Read)

```
사용자     List.tsx      insuranceProductApi      Backend      DB
  │           │                  │                   │         │
  │ 페이지 오픈 │                  │                   │         │
  │──────────▶│                  │                   │         │
  │           │ getInsuranceProducts()               │         │
  │           │─────────────────▶│                   │         │
  │           │                  │ GET /api/...      │         │
  │           │                  │──────────────────▶│         │
  │           │                  │                   │ findAll │
  │           │                  │                   │────────▶│
  │           │                  │◀──── 200 JSON[] ──│◀────────│
  │           │◀──── data[] ─────│                   │         │
  │◀── 표 렌더 ─│                  │                   │         │
```

**상태 전이**

```
mount → loading=true
     → 성공: products=data, loading=false
     → 실패: error=메시지, loading=false
```

### 7.3 시퀀스: 등록 (Create)

```
사용자     Create.tsx     API              Backend           DB
  │ 입력·제출 │              │                 │               │
  │──────────▶│              │                 │               │
  │           │ (프론트 필수값 검사)            │               │
  │           │ createInsuranceProduct(body)  │               │
  │           │─────────────▶│                 │               │
  │           │              │ POST + JSON     │               │
  │           │              │────────────────▶│               │
  │           │              │                 │ INSERT        │
  │           │              │                 │──────────────▶│
  │           │              │◀── 201 + body ──│◀──────────────│
  │           │◀─────────────│                 │               │
  │           │ navigate('/')                  │               │
  │◀── 목록 ──│ (목록이 다시 GET)              │               │
```

**프론트 의사코드**

```
onSubmit:
  if 필수값 비어 있음 → error 표시, return
  loading = true
  try
    await createInsuranceProduct(form)
    navigate('/')
  catch
    error = '등록 실패 메시지'
  finally
    loading = false
```

### 7.4 시퀀스: 수정 (Update)

```
[진입]
Edit mount → getInsuranceProduct(id) → 폼 state 채움

[제출]
Edit submit → updateInsuranceProduct(id, form) → 200
           → navigate('/')
```

상세:

| 단계 | 처리 |
|------|------|
| 1 | `useParams()` 로 `id` 획득 |
| 2 | `useEffect` 에서 GET 단건 |
| 3 | 응답 필드를 form state에 복사 |
| 4 | 사용자 수정 후 제출 |
| 5 | PUT body = Request 형태 (id 제외) |
| 6 | 성공 시 목록 이동 |

### 7.5 시퀀스: 삭제 (Delete)

```
목록 행 [삭제] 클릭
  → window.confirm('정말 삭제할까요?')
  → 취소면 종료
  → 확인 시 deleteInsuranceProduct(id)
  → 204
  → getInsuranceProducts() 로 products state 갱신
  → (선택) 삭제 중 해당 버튼 disabled
```

**목록을 다시 받는 이유 (초보용)**  
삭제 후 배열에서 `filter` 로 지워도 되지만,  
**서버 상태를 다시 읽는 방식**이 구현이 단순하고 데이터 불일치를 줄인다.

### 7.6 화면 전환 플로우 (사용자 관점)

```
[목록]
  │
  ├─[상품 등록]──▶ [등록 폼] ──제출 성공──▶ [목록] (새 행 있음)
  │                    │
  │                    └─취소──▶ [목록]
  │
  ├─[수정]──▶ [수정 폼] ──(로딩 후 값 표시)──제출 성공──▶ [목록]
  │              │
  │              └─취소──▶ [목록]
  │
  └─[삭제]──▶ confirm ──예──▶ API ──▶ [목록] (행 사라짐)
```

---

## 8. 검증·에러 규칙

### 8.1 프론트 검증 (1단계 권장 최소)

| 필드 | 규칙 | 실패 시 |
|------|------|---------|
| `name` | trim 후 비어 있으면 안 됨 | 제출 중단 + 메시지 |
| `company` | 동일 | 동일 |
| `type` | 동일 | 동일 |
| `monthlyPremium` | 숫자, 빈 값 불가, (권장) ≥ 0 | 동일 |
| `description` | 없음 | — |
| `status` | select 값만 | — |

### 8.2 서버 검증 (1단계 권장·선택)

현재 Request DTO에 Bean Validation이 없을 수 있다.  
시간 되면:

| 어노테이션 예 | 필드 |
|---------------|------|
| `@NotBlank` | name, company, type |
| `@NotNull` + `@DecimalMin("0")` | monthlyPremium |
| `@Size(max=…)` | 길이 제한 필드 |

없어도 **UI CRUD 완성 자체는 가능**. 안정화 태스크로 미뤄도 됨.

### 8.3 HTTP·화면 에러 매핑 (프론트)

| 상황 | 예상 status | 화면 처리 |
|------|-------------|-----------|
| 네트워크/서버 다운 | — | “서버에 연결할 수 없습니다” |
| 등록/수정 실패 | 4xx/5xx | “저장에 실패했습니다” + console.error |
| 목록 조회 실패 | 4xx/5xx | 목록 영역 에러 문구 (기존 패턴) |
| 단건 없음 | 500(현재) 또는 404(개선 후) | 수정 페이지 에러 + 목록 링크 |
| 삭제 실패 | 4xx/5xx | alert 또는 목록 상단 에러 |

### 8.4 알려진 백엔드 한계 (1단계 허용)

| 이슈 | 현상 | 1단계 대응 |
|------|------|------------|
| 없는 id | 500에 가까운 응답 가능 | 문서화만 / 여유 시 404 핸들러 |
| 필수값 null POST | DB/서버 오류 가능 | 프론트 검증으로 1차 차단 |

---

## 9. 학습 사항 (1단계 세부)

아래는 “코드를 짜면서 익혀야 할 개념”이다.  
구현 태스크와 1:1로 연결해 학습한다.

### 9.1 반드시 이해 (Must)

| # | 학습 항목 | 설명 | 연결 구현 |
|---|-----------|------|-----------|
| L1 | REST Method 의미 | POST 생성, GET 조회, PUT 수정, DELETE 삭제 | API 호출 전부 |
| L2 | JSON 필드 camelCase | FE·BE 필드명 일치 (`monthlyPremium`) | 폼 submit body |
| L3 | HTTP 상태 코드 | 201/200/204 구분 | Network 탭 확인 |
| L4 | React state | form, list, loading, error | 모든 페이지 |
| L5 | `useEffect` 1회 로드 | 마운트 시 목록/단건 GET | List, Edit |
| L6 | controlled input | `value` + `onChange` | Create, Edit |
| L7 | async/await + try/catch | API 성공/실패 분기 | 모든 호출 |
| L8 | 라우팅 | path, Link, navigate, useParams | App + Edit |
| L9 | 계층 역할 | UI는 API만 호출, DB는 백엔드 | 아키텍처 감각 |
| L10 | CORS 존재 이유 | 5173≠8080 | 이미 설정됨, 개념만 |

### 9.2 알면 좋은 것 (Should)

| # | 학습 항목 | 설명 |
|---|-----------|------|
| L11 | 더티 체킹 | 수정 시 Service에서 setter 후 save 없이도 UPDATE |
| L12 | DTO 분리 이유 | Entity 직접 노출 방지 |
| L13 | BigDecimal vs number | 돈은 서버 BigDecimal, JSON number |
| L14 | 204 No Content | 삭제 성공 시 body 없음 → `response.data` 기대 금지 |
| L15 | 목록 재조회 vs 로컬 filter | 단순함 vs 최적화 |

### 9.3 1단계에서 깊게 안 파도 되는 것 (Later)

| 항목 | 시기 |
|------|------|
| Spring Security, JWT | 2단계 |
| JPA 연관관계 (`@ManyToOne`) | 3단계 |
| 전역 상태 Redux 등 | 불필요 (useState로 충분) |
| Vite proxy | CORS로 이미 동작; 나중에 선택 |

### 9.4 학습 순서 = 구현 순서

```
Day 개념 복습
  ① API 5종 curl 확인 + create path 수정          ← L1,L2,L3
  ② Router 뼈대 (빈 페이지 3개)                    ← L8
  ③ Create 폼 + POST + 목록 이동                   ← L4,L6,L7
  ④ List 삭제 버튼 + DELETE + 재조회               ← L5,L7,L14
  ⑤ Edit: useParams + GET + PUT                   ← L5,L8
  ⑥ 검증·에러 메시지 다듬기                         ← L4
  ⑦ (선택) 서버 validation / 404                  ← L11 주변
```

**규칙**: ③이 끝나기 전에 ⑤를 시작하지 않는다.

---

## 10. 구현 태스크 분해 (WBS)

| Task ID | 작업 | 산출물 | 선행 | 완료 기준 |
|---------|------|--------|------|-----------|
| T0 | 환경 기동 확인 | BE·FE·MySQL 실행 | — | 목록 API 200 |
| T1 | create path `/` 수정 | `insuranceProductApi.ts` | T0 | POST curl·FE 동일 path |
| T2 | API 5종 수동 검증 | 메모 또는 성공 로그 | T1 | C/R/U/D 전부 성공 |
| T3 | App Router 연결 | `App.tsx` + 빈 페이지 | T0 | URL 3개 진입 가능 |
| T4 | Create 페이지 구현 | `InsuranceProductCreate.tsx` | T2,T3 | 화면 등록 → DB·목록 반영 |
| T5 | List에 등록 링크 | List 헤더 버튼 | T3 | 클릭 시 `/products/new` |
| T6 | Delete 구현 | List 행 버튼 | T2 | 삭제 후 목록 갱신 |
| T7 | Edit 페이지 구현 | `InsuranceProductEdit.tsx` | T2,T3 | 수정 후 목록 반영 |
| T8 | List에 수정 링크 | 행 “수정” | T7 | `/products/:id/edit` |
| T9 | UX 다듬기 | 검증, disabled, 메시지 | T4~T8 | 체크리스트 통과 |
| T10 | (선택) 서버 검증·404 | BE 소규모 수정 | T9 | 잘못된 입력 안전 처리 |

### 권장 커밋 단위

```
fix: 상품 등록 API 경로 슬래시 수정
feat: 상품 페이지 라우팅 뼈대
feat: 상품 등록 폼 연동
feat: 상품 삭제 버튼 연동
feat: 상품 수정 폼 연동
chore: 1단계 폼 검증 및 에러 메시지
```

---

## 11. 테스트 시나리오 (수동)

### 11.1 사전 조건

- MySQL `restapi_crud` 존재  
- `./gradlew bootRun` 성공  
- `cd frontend && npm run dev` 성공  

### 11.2 시나리오 표

| ID | 시나리오 | 절차 | 기대 결과 |
|----|----------|------|-----------|
| TC-R1 | 빈 목록 | DB 비운 뒤 목록 접속 | “등록된 상품이 없습니다” 류 메시지 |
| TC-C1 | 정상 등록 | 필수값 입력 후 등록 | 201, 목록에 행 추가 |
| TC-C2 | 필수값 누락 | 이름 비우고 등록 | 프론트에서 차단 또는 에러 표시 |
| TC-C3 | status 생략 | status 없이 POST | DB status = `판매중` |
| TC-R2 | 목록 표시 | 2건 등록 후 목록 | 2행, 보험료 포맷 |
| TC-U1 | 정상 수정 | 수정 화면에서 이름 변경 | 200, 목록 이름 변경 |
| TC-U2 | 수정 진입 | 목록 → 수정 | 기존 값이 폼에 채워짐 |
| TC-D1 | 정상 삭제 | 삭제 확인 | 204, 목록에서 제거 |
| TC-D2 | 삭제 취소 | confirm 취소 | 데이터 유지 |
| TC-E1 | 서버 중지 후 목록 | BE 끄고 새로고침 | 에러 메시지 (크래시 없음) |

### 11.3 curl 스모크 (백엔드 단독)

```bash
# 목록
curl -s http://localhost:8080/api/insurance-products

# 등록
curl -s -X POST http://localhost:8080/api/insurance-products \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","company":"테스트사","type":"종신","monthlyPremium":10000}'

# 단건 (id=1 가정)
curl -s http://localhost:8080/api/insurance-products/1

# 수정
curl -s -X PUT http://localhost:8080/api/insurance-products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트수정","company":"테스트사","type":"종신","monthlyPremium":12000,"status":"판매중"}'

# 삭제
curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:8080/api/insurance-products/1
# 기대: 204
```

---

## 12. 상태 설계 (프론트)

### 12.1 목록 페이지

| state | 타입 | 초기값 | 설명 |
|-------|------|--------|------|
| `products` | `InsuranceProductResponse[]` | `[]` | 목록 데이터 |
| `loading` | `boolean` | `true` | 최초 로딩 |
| `error` | `string \| null` | `null` | 에러 메시지 |
| (선택) `deletingId` | `number \| null` | `null` | 삭제 중 행 |

### 12.2 등록·수정 페이지

| state | 타입 | 설명 |
|-------|------|------|
| `name` 등 필드 | string / number | 폼 값 (또는 하나의 `form` 객체) |
| `loading` | boolean | 제출 중 (Edit는 초기 로드용 분리 가능) |
| `error` | string \| null | 실패 메시지 |
| Edit: `initialLoading` | boolean | 단건 GET 중 |

### 12.3 폼 데이터 ↔ API 매핑

| 폼 state | Request JSON | 변환 |
|----------|--------------|------|
| name | name | trim 권장 |
| company | company | trim 권장 |
| type | type | trim 권장 |
| monthlyPremium | monthlyPremium | `Number(...)` 로 number 보장 |
| description | description | 빈 문자열이면 `undefined` 또는 `""` (서버 null 허용) |
| status | status | select 값 |

---

## 13. 보안·운영 (1단계 수준)

| 항목 | 1단계 방침 |
|------|------------|
| 인증 | 없음 — 로컬 학습용. 인터넷 노출 금지 |
| CORS | 개발 origin만 허용 (현재 설정 유지) |
| 비밀번호 | N/A |
| SQL Injection | JPA 파라미터 바인딩으로 기본 완화 |
| XSS | React 기본 이스케이프에 위임. `dangerouslySetInnerHTML` 사용 금지 |
| 시크릿 | `application.properties` DB 비번은 로컬 전용. 커밋 주의는 팀 규칙에 따름 |

---

## 14. 리스크와 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| create path `/` 누락 | 등록만 실패 | T1 최우선 |
| BE/FE 동시 미기동 | 전체 실패 | 실행 체크리스트 |
| 없는 id 수정 URL | 나쁜 UX | 에러 화면 + 목록 링크 |
| 한 번에 C·U·D 구현 | 디버깅 붕괴 | WBS 순서 강제 |
| 2단계 코드 혼입 | 범위 폭발 | 비목표 준수 |

---

## 15. 완료 정의 (Definition of Done)

다음을 **모두** 만족하면 1단계 종료로 본다.

- [ ] T0~T9 완료 (T10 선택)  
- [ ] TC-C1, TC-R2, TC-U1, TC-D1 수동 통과  
- [ ] Network 탭에서 201 / 200 / 204 확인 가능  
- [ ] `ROADMAP_3PHASE.md` 1단계 체크리스트와 일치  
- [ ] User/Order 관련 코드 없음  
- [ ] (문서) 이 설계서 기준으로 구현이 설명 가능  

**1단계 종료 후**: `ROADMAP_3PHASE.md` 의 **2단계**로 이동.  
2단계 설계서는 별도 문서로 작성한다.

---

## 16. 부록

### 16.1 Laravel 대응표 (감각 유지)

| Laravel | 1단계 대응 |
|---------|------------|
| `routes/api.php` | `InsuranceProductController` 매핑 |
| Eloquent Model | `InsuranceProduct` Entity |
| Form Request | `InsuranceProductRequest` (+ 이후 validation) |
| API Resource | `InsuranceProductResponse` |
| Blade index/create/edit | React pages List/Create/Edit |
| `axios` in JS | `insuranceProductApi.ts` |

### 16.2 관련 소스 경로

| 구분 | 경로 |
|------|------|
| Entity | `src/main/java/com/yama331/restapi_crud/entity/InsuranceProduct.java` |
| Repository | `.../repository/InsuranceProductRepository.java` |
| Request DTO | `.../dto/InsuranceProductRequest.java` |
| Response DTO | `.../dto/InsuranceProductResponse.java` |
| Service | `.../service/InsuranceProductService.java` |
| Controller | `.../controller/InsuranceProductController.java` |
| CORS | `.../config/WebConfig.java` |
| FE types | `frontend/src/types/insuranceProduct.ts` |
| FE api | `frontend/src/api/insuranceProductApi.ts` |
| FE list | `frontend/src/pages/InsuranceProductList.tsx` |

### 16.3 문서 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0 | 2026-08-07 | 1단계 상세 설계서 최초 작성 (현행 코드 기준) |

---

## 17. 한 페이지 요약 (프린트용)

| 항목 | 내용 |
|------|------|
| **목표** | 브라우저 상품 CRUD 완성 |
| **테이블** | `insurance_products`  alone |
| **컬럼** | id, name, company, type, monthly_premium, description, status, created_at, updated_at |
| **API** | POST/GET/GET{id}/PUT/DELETE `/api/insurance-products` |
| **화면** | `/` 목록, `/products/new` 등록, `/products/:id/edit` 수정 |
| **순서** | path 수정 → 라우터 → Create → Delete → Edit → 다듬기 |
| **제외** | 로그인, 주문, 검색, 결제 |
| **완료** | 화면만으로 C/R/U/D + 로딩/에러 |

---

> **다음 행동**  
> **따라 하기 매뉴얼**은 [`PHASE1_MANUAL.md`](./PHASE1_MANUAL.md) (Work 0~7, 코드 예시 포함).  
> 이 설계서의 **T1 → T2 → T3 → T4** 와 매뉴얼 Work 순서는 같다.  
> 전체 로드맵은 `ROADMAP_3PHASE.md`, 복습용 가이드는 `CRUD_LEARNING_GUIDE.md` 를 참고한다.
