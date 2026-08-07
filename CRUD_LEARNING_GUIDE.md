# 보험상품 CRUD 학습 가이드

> **대상**: Laravel MVC는 써 봤고, React + Spring Boot REST는 처음인 사람  
> **목표**: 보험상품 관리를 소재로 **백엔드 API + 프론트엔드 화면까지 CRUD 한 바퀴 완성**  
> **작성 기준**: 현재 프로젝트 코드를 직접 검토한 결과 (2026-08)

---

## 1. 이 문서가 하는 일

1. **지금까지 만든 것을 정리** — 무엇이 잘 됐고, 어디까지 왔는지  
2. **앞으로의 방향** — CRUD 완성을 위한 가이드라인  
3. **학습 순서** — 왜 이 순서로 했는지, 다음에 뭘 할지  
4. **초보자용 설명** — 용어·흐름을 쉽게 풀어 쓰기  

보험 도메인을 깊게 파는 문서가 **아닙니다**.  
**“분리된 프론트/백에서 CRUD를 끝까지 만드는 방법”** 이 핵심입니다.

---

## 2. 한 줄로 보는 현재 위치

| 구분 | 상태 | 비고 |
|------|------|------|
| 백엔드 Entity ~ REST API (CRUD 전체) | ✅ 거의 완료 | Create / Read / Update / Delete API 모두 있음 |
| CORS (프론트 ↔ 백 연결) | ✅ 완료 | `WebConfig` |
| 프론트 타입 + API 함수 | ✅ 거의 완료 | 등록 경로 소소한 수정 필요 |
| 프론트 목록 화면 (R) | ✅ 완료 | `InsuranceProductList` |
| 프론트 등록 / 수정 / 삭제 화면 (CUD) | ❌ 미완 | **다음 핵심 작업** |
| 입력 검증, 예외 → 404 처리 | ❌ 미완 | CRUD 안정화 단계 |
| 인증 / 권한 | 🚫 비목표 | 지금은 안 함 |

**요약**: 백엔드는 CRUD API가 이미 있고, 프론트는 **조회(R)** 까지 연결됨.  
**앞으로의 중심은 “프론트에서 C·U·D UI를 붙여 한 화면 흐름으로 완성”** 이다.

---

## 3. 왜 이런 구조인가? (Laravel과 비교)

Laravel에서는 종종 **한 앱 안에서** 라우트 → 컨트롤러 → 뷰까지 처리한다.

이 프로젝트는 이렇게 나뉜다.

```
[ 브라우저 ]
     │
     ▼
[ React (프론트) ]  ← 화면, 버튼, 표, 폼   포트 5173
     │  HTTP + JSON (axios)
     ▼
[ Spring Boot (백) ]  ← 데이터 처리, DB    포트 8080
     │
     ▼
[ MySQL ]
```

| Laravel (익숙한 쪽) | 이 프로젝트 |
|---------------------|-------------|
| Blade 화면 | React 페이지 (`pages/`) |
| `routes/api.php` + Controller | `@RestController` |
| Eloquent Model | JPA **Entity** |
| Eloquent 조회/저장 | **Repository** |
| Service / Action | **Service** |
| Form Request / Resource | **DTO** (Request / Response) |
| CORS / middleware | `config/WebConfig` |

**기억할 한 가지**  
프론트는 “HTML을 그려 주는 서버”가 아니라,  
**백엔드가 주는 JSON을 받아서 화면을 그리는 클라이언트**다.

---

## 4. 백엔드 계층 — 역할만 기억하기

요청이 들어왔을 때 흐름:

```
Controller  →  Service  →  Repository  →  DB
   (입구)      (로직)       (DB 접근)
     ↑
   DTO로 받음 / DTO로 돌려줌
```

| 패키지 | 파일 예시 | 역할 (초보 버전) |
|--------|-----------|------------------|
| `entity` | `InsuranceProduct.java` | DB 테이블과 1:1 매핑. “진짜 저장 형태” |
| `repository` | `InsuranceProductRepository.java` | DB에 저장·조회·삭제. 구현 코드는 Spring이 자동 생성 |
| `dto` | `InsuranceProductRequest` / `Response` | 외부와 주고받는 JSON 계약 |
| `service` | `InsuranceProductService.java` | 실제 CRUD 로직, Entity ↔ DTO 변환 |
| `controller` | `InsuranceProductController.java` | URL + HTTP 메서드 매핑 |
| `config` | `WebConfig.java` | CORS 등 전역 설정 |

### Entity를 그대로 API에 안 쓰는 이유

- DB 구조가 바깥으로 그대로 노출된다.  
- 나중에 “비밀번호 같은 필드”가 생기면 위험하다.  
- 요청에 필요한 필드와 응답에 필요한 필드가 다를 수 있다.  

→ 그래서 **Request DTO / Response DTO** 를 쓴다. (이미 잘 적용되어 있음)

### REST URL (이미 구현됨)

| 동작 | Method | URL | 성공 코드 |
|------|--------|-----|-----------|
| 등록 (Create) | `POST` | `/api/insurance-products` | **201** |
| 전체 조회 (Read) | `GET` | `/api/insurance-products` | **200** |
| 단건 조회 (Read) | `GET` | `/api/insurance-products/{id}` | **200** |
| 수정 (Update) | `PUT` | `/api/insurance-products/{id}` | **200** |
| 삭제 (Delete) | `DELETE` | `/api/insurance-products/{id}` | **204** (본문 없음) |

이 표가 **프론트 API 함수와 1:1** 로 맞아야 한다. (이미 거의 맞춤)

---

## 5. 지금까지 한 일 — 종합 검토

### 5.1 잘 된 점 (유지하면 되는 것)

**백엔드**

- 계층이 한쪽으로 치우치지 않고 **Controller → Service → Repository** 로 나뉨  
- Entity에 금액 `BigDecimal`, 생성/수정 시각 자동 기록 등 실무 감각 반영  
- Response DTO의 `from(Entity)` 변환 패턴이 깔끔함  
- HTTP 상태 코드(201, 200, 204)를 의도에 맞게 사용  
- CORS로 프론트 포트(5173) 허용  

**프론트**

- `types` / `api` / `pages` 로 역할 분리 (나중에 기능 늘리기 좋음)  
- 백엔드 DTO와 TypeScript 타입을 맞춰 둠  
- 목록 페이지에 **로딩 / 에러 / 빈 목록** 분기 있음  
- axios 인스턴스에 `baseURL` 한곳 관리  

→ **첫 REST CRUD 연습 기준으로 “골격은 합격”** 이다.

### 5.2 아직 부족한 점 (다음에 채울 것)

| 우선순위 | 항목 | 설명 |
|----------|------|------|
| 🔴 높음 | 프론트 CUD UI | 등록 폼, 수정 폼, 삭제 버튼이 없음 → **CRUD 목표 미완** |
| 🔴 높음 | 등록 API 경로 | `createInsuranceProduct` 에 `/` 누락 (`api/...` → `/api/...`) |
| 🟡 중간 | 서버 입력 검증 | 이름 없이 POST 해도 일단 들어감 → `@NotBlank` 등 |
| 🟡 중간 | 없는 id 조회 시 응답 | 지금은 예외가 500에 가깝게 나갈 수 있음 → 404로 바꾸는 게 좋음 |
| 🟢 낮음 | 라우팅 | `react-router-dom` 설치만 되고 미사용 (목록/등록/수정 페이지 분리 시 사용) |
| 🟢 낮음 | PROJECT.md 동기화 | 문서상 “미구현”이 남아 있으면 헷갈림 |

### 5.3 파일 지도 (지금 프로젝트 기준)

```
restapi_crud/
├── src/main/java/com/yama331/restapi_crud/
│   ├── entity/InsuranceProduct.java          ✅
│   ├── repository/InsuranceProductRepository.java  ✅
│   ├── dto/InsuranceProductRequest.java      ✅
│   ├── dto/InsuranceProductResponse.java     ✅
│   ├── service/InsuranceProductService.java  ✅ CRUD 로직
│   ├── controller/InsuranceProductController.java  ✅ REST 5종
│   └── config/WebConfig.java                 ✅ CORS
│
└── frontend/src/
    ├── types/insuranceProduct.ts             ✅
    ├── api/axios.ts                          ✅
    ├── api/insuranceProductApi.ts            ✅ (등록 path 수정 권장)
    ├── pages/InsuranceProductList.tsx        ✅ 목록만
    └── App.tsx                               ✅ 목록 연결
```

---

## 6. 학습 순서 — 왜 이렇게 했고, 다음에 뭐 할지

학습은 **아래 → 위**, 그리고 **백엔드 → 연결 → 프론트** 가 가장 덜 헷갈린다.

### 이미 지나온 단계 (복습용)

```
① Entity          DB에 어떤 테이블/컬럼이 있는지 정함
      ↓
② Repository      저장·조회 도구 준비 (JpaRepository)
      ↓
③ DTO             바깥과 주고받을 JSON 모양 정함
      ↓
④ Service         Entity ↔ DTO, CRUD 로직
      ↓
⑤ Controller      URL + HTTP 메서드 공개
      ↓
⑥ CORS            브라우저가 다른 포트 API를 호출할 수 있게
      ↓
⑦ 프론트 types/api  백엔드 계약과 타입·함수 맞추기
      ↓
⑧ 목록 화면 (R)   GET 연동 + 표 출력
```

각 단계를 건너뛰면 생기는 전형적인 문제:

| 건너뛴 것 | 증상 |
|-----------|------|
| Entity 없이 Service | “뭘 저장하는지”가 없음 |
| DTO 없이 Controller | Entity가 API에 그대로 노출 |
| CORS 없이 프론트 호출 | 브라우저 콘솔 CORS 에러 |
| types 없이 UI | 오타·필드 누락을 런타임에야 발견 |

### 앞으로 권장 순서 (CRUD 완성까지)

```
[1] 소소한 수정
    - createInsuranceProduct 경로 앞에 `/` 붙이기
    - (선택) Postman/curl 로 API 5종 먼저 손으로 확인

[2] 프론트 Create
    - 등록 폼 페이지 (또는 모달)
    - createInsuranceProduct 호출 → 성공 시 목록 새로고침 or 목록으로 이동

[3] 프론트 Delete
    - 목록 행에 삭제 버튼
    - 확인(confirm) → deleteInsuranceProduct → 목록 갱신

[4] 프론트 Update
    - 수정 폼 (단건 GET으로 기존 값 채우기)
    - updateInsuranceProduct 호출

[5] 페이지 분리 (선택이지만 추천)
    - /                 목록
    - /products/new     등록
    - /products/:id/edit 수정
    - react-router-dom 사용

[6] 안정화
    - 백엔드: 필수값 검증
    - 없는 id → 404
    - 프론트: API 에러 메시지 화면에 표시

[7] (여유 있으면) 검색·필터, 페이지네이션 — CRUD 기본이 끝난 뒤
```

**원칙**:  
백엔드 API가 이미 있으므로, **앞으로는 UI를 하나씩 붙이면서 “호출 → 화면 반영”만 반복**하면 된다.  
새 계층을 또 만들 필요는 없다.

---

## 7. 가이드라인 (앞으로 코드 짤 때 지킬 것)

### 7.1 백엔드

1. **Controller는 얇게**  
   - JSON 받고, Service 호출하고, 상태 코드 돌려주기만  
   - DB 접근 코드는 Controller에 넣지 않기  

2. **Service에 로직 모으기**  
   - “없을 때 예외”, “status 기본값”, 여러 테이블 처리 등  

3. **Entity ≠ API 계약**  
   - 바깥 입출력은 항상 DTO  

4. **REST 의미 유지**  
   - 생성 성공 → 201  
   - 삭제 성공 → 204  
   - 없는 자원 → 404 (나중에 ExceptionHandler로)  

5. **검증은 서버에서도**  
   - 프론트 검증만 믿지 않기 (직접 API 호출 가능)  

### 7.2 프론트

1. **API 호출은 `api/` 모듈에만**  
   - 페이지 컴포넌트에서 `axios.get` 직접 남발하지 않기  
   - 이미 `insuranceProductApi.ts` 패턴을 유지  

2. **타입은 백엔드 DTO와 이름·필드를 맞추기**  
   - 백에서 필드 바뀌면 types도 같이 수정  

3. **화면 상태 3종은 기본**  
   - loading / error / success(데이터)  
   - 목록 페이지에서 이미 쓰는 패턴을 등록·수정에도 복붙 후 다듬기  

4. **성공 후 목록과 맞추기**  
   - 등록·수정·삭제 성공 뒤 → 목록 다시 불러오기 또는 해당 행 갱신  

5. **baseURL은 한곳**  
   - `axios.ts` 만 수정하면 서버 주소가 바뀌게  

### 7.3 작업 습관

| 습관 | 이유 |
|------|------|
| API 하나 만들면 Postman/curl로 먼저 확인 | 프론트 버그인지 백 버그인지 분리 |
| 한 번에 Create 또는 Delete 하나만 UI에 붙이기 | 범위가 커지면 디버깅이 어려움 |
| 주석은 “왜” 위주 | “무엇을”은 코드로 이미 보이면 충분 |
| 커밋은 기능 단위 | 예: `feat: 상품 등록 폼 연동` |

### 7.4 지금 당장 고치면 좋은 한 줄

`frontend/src/api/insuranceProductApi.ts` 등록 함수:

```ts
// 지금 (버그 가능): baseURL 뒤에 경로가 이상하게 붙을 수 있음
api.post('api/insurance-products', data)

// 권장: 다른 함수들과 같이 앞에 /
api.post('/api/insurance-products', data)
```

---

## 8. CRUD를 “완성”이라고 부르는 기준

아래가 모두 되면 **1차 목표 달성**으로 보면 된다.

### 백엔드 (이미 대부분 충족)

- [x] 상품 등록 API  
- [x] 전체 목록 API  
- [x] 단건 조회 API  
- [x] 수정 API  
- [x] 삭제 API  
- [ ] (권장) 잘못된 입력 거부  
- [ ] (권장) 없는 id → 404  

### 프론트 (여기가 남은 본체)

- [x] 목록 보기  
- [ ] 새 상품 등록 후 목록에 나타남  
- [ ] 상품 수정 후 목록/상세에 반영  
- [ ] 상품 삭제 후 목록에서 사라짐  
- [ ] 로딩·실패 시 사용자에게 안내  

### 연동

- [x] CORS로 브라우저에서 API 호출 가능  
- [ ] 등록·수정·삭제까지 브라우저만으로 확인 가능 (Postman 없이)

---

## 9. 실행 방법 (매 작업 전 체크)

### 사전 조건

1. MySQL 실행  
2. DB `restapi_crud` 생성  
3. `application.properties` 의 계정/비밀번호 일치  

### 터미널 2개

```bash
# 터미널 1 — 백엔드 (프로젝트 루트)
./gradlew bootRun
# → http://localhost:8080

# 터미널 2 — 프론트
cd frontend
npm run dev
# → http://localhost:5173
```

### API만 빠르게 확인 (예시)

```bash
# 목록
curl http://localhost:8080/api/insurance-products

# 등록
curl -X POST http://localhost:8080/api/insurance-products \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트종신","company":"삼성생명","type":"종신","monthlyPremium":50000,"description":"연습용"}'
```

프론트 UI를 붙이기 **전에** 위가 되면, 이후 문제는 거의 프론트 쪽이다.

---

## 10. 다음 작업 예시 시나리오 (초보용)

### 시나리오 A — 등록 화면 (Create)

1. `pages/InsuranceProductForm.tsx` (또는 Create 전용) 생성  
2. input: name, company, type, monthlyPremium, description  
3. 제출 시 `createInsuranceProduct(formData)`  
4. 성공 → `navigate('/')` 또는 목록 state 갱신  
5. 실패 → 빨간 에러 문구  

### 시나리오 B — 삭제 (Delete)

1. 목록 테이블 각 행에 “삭제” 버튼  
2. `window.confirm('정말 삭제할까요?')`  
3. `deleteInsuranceProduct(id)`  
4. 성공 후 `getInsuranceProducts()` 다시 호출해 state 갱신  

### 시나리오 C — 수정 (Update)

1. 목록에서 “수정” 클릭 → 수정 페이지 (`/products/1/edit`)  
2. `getInsuranceProduct(id)` 로 기존 값 채우기  
3. 제출 시 `updateInsuranceProduct(id, formData)`  
4. 성공 → 목록으로  

이 세 시나리오만 끝나면 **프론트 CRUD 완성**이다.

---

## 11. 자주 막히는 지점 (미리 보기)

| 증상 | 의심 지점 |
|------|-----------|
| 브라우저 CORS 에러 | 백엔드 안 뜸 / `WebConfig` origin 불일치 |
| Network 404 | URL 오타, 앞 `/` 누락, 서버 포트 틀림 |
| Network 500 | 서버 로그 확인 (DB 연결, null 필수값 등) |
| 목록은 되는데 등록만 실패 | Request 필드명 camelCase 맞는지, Content-Type |
| 화면은 도는데 데이터 없음 | DB 비어 있음 / API는 200이지만 `[]` |
| 수정했는데 안 바뀜 | PUT body 누락, id path 오타, 목록 미갱신 |

**디버깅 순서 습관**

1. 브라우저 Network 탭 — 요청 URL, method, status, response  
2. 같은 요청을 curl/Postman으로 재현  
3. 백엔드 콘솔 SQL / 스택트레이스  

---

## 12. 하지 않아도 되는 것 (범위 밖)

CRUD 1차 목표에서는 아래는 **일부러 미룬다**.

- 로그인 / JWT / 권한  
- 보험 실무 수준의 복잡한 상품 구조  
- 결제, 청약, 계약 관리  
- 마이크로서비스 분리  
- 예쁜 디자인 시스템 (동작 우선, UI는 단순해도 됨)  

먼저 **“추가 → 목록에 보임 → 고침 → 지움”** 이 브라우저에서 되게 만드는 것이 목표다.

---

## 13. 추천 학습 루틴 (하루 단위 예시)

| 회차 | 할 일 | 완료 기준 |
|------|--------|-----------|
| Day 1 복습 | Entity~Controller 흐름 소리 내어 설명 | “요청이 어디까지 가는지” 말할 수 있음 |
| Day 2 | API 5종 curl 확인 + 등록 path 수정 | Postman/curl로 C/R/U/D 성공 |
| Day 3 | 등록 폼 UI 연동 | 화면에서 상품 추가 → 목록 반영 |
| Day 4 | 삭제 버튼 연동 | 화면에서 삭제 → 목록에서 사라짐 |
| Day 5 | 수정 폼 + 라우터 | 수정 후 값 변경 확인 |
| Day 6 | 검증·404·에러 메시지 | 잘못된 입력/없는 id  gracefully 처리 |

속도는 사람마다 다르다. **하루 한 기능** 이 유지하기 좋다.

---

## 14. 전체 요약

1. **목적**: React + Spring Boot 로 REST CRUD 한 바퀴  
2. **현재**: 백엔드 CRUD API + 프론트 목록(R) 까지 잘 구성됨  
3. **다음**: 프론트 등록·수정·삭제 UI + 작은 버그 수정 + 검증/404  
4. **원칙**: 계층 유지, DTO 유지, API는 `api/` 모듈, 화면은 loading/error 챙기기  
5. **완성 정의**: 브라우저만으로 상품을 추가·조회·수정·삭제할 수 있으면 1차 성공  

---

## 15. 관련 파일 빠른 링크

| 보고 싶을 때 | 경로 |
|--------------|------|
| 프로젝트 개요(기존) | `PROJECT.md` |
| Entity | `src/main/java/.../entity/InsuranceProduct.java` |
| Service | `src/main/java/.../service/InsuranceProductService.java` |
| Controller | `src/main/java/.../controller/InsuranceProductController.java` |
| CORS | `src/main/java/.../config/WebConfig.java` |
| FE 타입 | `frontend/src/types/insuranceProduct.ts` |
| FE API | `frontend/src/api/insuranceProductApi.ts` |
| FE 목록 | `frontend/src/pages/InsuranceProductList.tsx` |

---

> **마지막 한 줄**  
> 골격은 이미 잘 잡혀 있다. 남은 일은 새로운 아키텍처를 만드는 것이 아니라,  
> **이미 있는 API에 화면 버튼을 하나씩 연결해 CRUD를 “손으로 끝나는” 상태로 만드는 것**이다.
