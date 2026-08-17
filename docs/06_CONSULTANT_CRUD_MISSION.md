# 3번째 CRUD: 설계사(Consultant) 미션북

| 항목 | 내용 |
|------|------|
| 대상 | 보험상품 CRUD + 고객 CRUD 를 이미 끝낸 사람 |
| 목표 | 같은 패턴을 **매뉴얼 코드 없이** 한 번 더 그린다. 거시가 손에서 나오게 |
| 방식 | 개념 → 아주 쉬운 설명 → **네가 푸는 미션**. 정답 코드는 이 문서에 없다 |
| 연습 소재 | **설계사** (`Consultant`). 상품·고객과 관계 없는 단독 테이블 |
| 다음 문서 | 이 체크리스트가 끝난 뒤 `07_REST_CONTRACT_MISSION.md` |
| 관련 | `00_README.md` · `05_CUSTOMER_CRUD_MANUAL.md`(참고만) · 기존 `Customer*` / `InsuranceProduct*` 파일 |
| 하지 않는 것 | `@Valid` 검증, 404 JSON, 검색, 이메일/사번 unique, 로그인, 주문, 상품·고객 연결 |

---

## 0. 이 문서가 이전 매뉴얼과 다른 점

1·2번째는 선생님이 코드를 보여 줬다.  
이번은 **스펙과 미션만** 있다. 구현은 네가 쓴다.

| | 상품·고객 매뉴얼 | 이번 (설계사) | 그다음 REST 계약 |
|--|------------------|---------------|------------------|
| 누가 코드를 쓰나 | 문서 | **너** | 너 |
| 새 테이블 | 있음 | **있음** | 없음 |
| 배우는 것 | 층이 있고 파일이 짝이다 | 그 층을 **빈 파일에서** 재현 | 실패·검색까지 계약 |
| 막히면 | 부록 복붙 | 힌트 + 기존 **파일** 참고 | 힌트 + 개념 질문 |

### 나와(Grok)의 역할

- 개념·방향·힌트는 준다.
- “이 파일 전체 짜 줘” 에는 답을 주지 않는다.
- 네가 쓴 코드를 가져오면, 어느 층이 빠졌는지·상품/고객과 어디가 다른지만 짚는다.

### 기존 매뉴얼을 보는 법

`05_CUSTOMER_CRUD_MANUAL.md` 를 옆에 펼쳐 두고 **통째로 옮기지 마라.**  
헷갈리는 **한 층**만 고객 파일을 연다. 연 뒤에는 닫고, 설계사 파일에 네 손으로 적는다.

---

## 1. 왜 설계사인가

세 번째도 CRUD 다. 일부러 새 기술을 넣지 않는다.

| 이유 | 설명 |
|------|------|
| 단독 도메인 | 상품·고객 테이블을 안 건드린다. 깨져도 범위가 작다 |
| 패턴 동일 | Entity → Repository → DTO → Service → Controller → types → api → pages |
| 필드가 살짝 다름 | 고객을 이름만 바꾸면 안 된다. 사번·입사일·재직 상태를 네가 매핑한다 |
| 보험 소재와 맞음 | 나중에 “누가 팔았나”를 붙일 자리가 생긴다. **지금은 연결하지 않는다** |

고객과 **똑같이 생긴 네 번째 사람 테이블**을 또 만들면 복붙이 된다.  
그래서 이메일 필수/주소/생일을 그대로 쓰지 않는다.

---

## 2. 고정 스펙 (이 표는 바꾸지 않는다)

미션마다 “필드 뭐 하지?” 로 새지 않게, **계약의 행복 경로만** 여기에 고정한다.  
검증 어노테이션·404 JSON·검색은 아직 없다.

### 2-A. 자원

| 항목 | 값 |
|------|-----|
| 한국어 | 설계사 |
| Java / TS 이름 | `Consultant` |
| 테이블 | `consultants` |
| API | `/api/consultants` |
| 화면 | `/consultants`, `/consultants/new`, `/consultants/:id/edit` |

### 2-B. 컬럼

| 필드 (Java) | DB 컬럼 | 타입 | 필수 | 설명 |
|-------------|---------|------|------|------|
| id | id | Long, 자동증가 | PK | 우리가 안 넣음 |
| name | name | 문자열 50 | 필수 | 이름 |
| employeeCode | employee_code | 문자열 20 | 필수 | 사번. 예: `C-001` |
| phone | phone | 문자열 20 | 필수 | 연락처 |
| email | email | 문자열 100 | 선택 | 없으면 null |
| hireDate | hire_date | 날짜 | 선택 | 입사일 `YYYY-MM-DD` |
| status | status | 문자열 20 | 필수 | 안 보내면 Service 에서 `"재직"` |
| createdAt | created_at | 시각 | 자동 | `@CreationTimestamp` |
| updatedAt | updated_at | 시각 | 자동 | `@UpdateTimestamp` |

상태 값 (화면 select): `재직` / `휴직` / `퇴직`

### 2-C. JSON 예시 (등록)

```json
{
  "name": "박설계",
  "employeeCode": "C-001",
  "phone": "010-2222-3333",
  "email": "park@example.com",
  "hireDate": "2020-03-01",
  "status": "재직"
}
```

선택 필드는 생략 가능하다. 생략 시 `email`, `hireDate` 는 null, `status` 는 `"재직"`.

### 2-D. HTTP (행복 경로만)

| 동작 | Method | URL | 성공 |
|------|--------|-----|------|
| 등록 | POST | `/api/consultants` | **201** + 본문 |
| 목록 | GET | `/api/consultants` | **200** + 배열 |
| 단건 | GET | `/api/consultants/{id}` | **200** + 본문 |
| 수정 | PUT | `/api/consultants/{id}` | **200** + 본문 |
| 삭제 | DELETE | `/api/consultants/{id}` | **204** 본문 없음 |

없는 id 는 고객과 **같은 수준**이면 된다.  
지금은 `IllegalArgumentException` 이어도 된다. 예쁜 404 JSON 은 다음 문서다.

### 2-E. 만들지 않는 파일

새 공통 설정, 새 예외 패키지, 검증 starter, 검색 메서드, 로그인.  
건드려도 되는 기존 파일은 **라우터와 목록 페이지의 링크** 정도다.

---

## 3. 머릿속에 넣을 그림

### 3-A. 요청 한 방 (등록)

```
[브라우저 폼] 또는 [Postman]
      │  POST /api/consultants
      │  { name, employeeCode, phone, ... }
      ▼
ConsultantController.create()
      │  @RequestBody → ConsultantRequest
      ▼
ConsultantService.create()
      │  Request → Entity
      │  repository.save
      ▼
consultants 테이블 INSERT
      │
      ▼
ConsultantResponse.from(entity)
      │  201 + JSON
      ▼
화면 / Postman
```

파일을 만들 때마다 “지금 이 층” 이라고 이 그림을 다시 본다.

### 3-B. 짝 맞추기 (미션 0 에서 네가 채운다)

작업 중 헷갈리면 **네가 채운 표**만 본다.

| 할 일 | 상품 | 고객 | 설계사 (네가 씀) |
|-------|------|------|------------------|
| Entity | `InsuranceProduct` | `Customer` | |
| Repository | `InsuranceProductRepository` | `CustomerRepository` | |
| Request DTO | `InsuranceProductRequest` | `CustomerRequest` | |
| Response DTO | `InsuranceProductResponse` | `CustomerResponse` | |
| Service | `InsuranceProductService` | `CustomerService` | |
| Controller | `InsuranceProductController` | `CustomerController` | |
| API 경로 | `/api/insurance-products` | `/api/customers` | |
| TS 타입 | `insuranceProduct.ts` | `customer.ts` | |
| axios 함수 | `insuranceProductApi.ts` | `customerApi.ts` | |
| 목록/등록/수정 | `InsuranceProduct*.tsx` | `Customer*.tsx` | |
| 화면 경로 | `/`, `/products/...` | `/customers/...` | |

---

## 4. 이 문서 쓰는 법

1. **한 Work 가 완료 기준을 통과한 뒤에만** 다음으로 간다.
2. 프론트는 **Postman 5종이 성공한 뒤**에만 시작한다.
3. 학습 일기 세 줄:

```
한 일:
막힌 줄:
고객/상품 파일에서 참고한 것:
```

4. 하루에 Work 1~2개면 충분하다. 백엔드와 프론트를 하루에 다 끝내지 마라.

### 끝났다고 말하는 기준

- [ ] Postman: 설계사 POST / GET 목록 / GET 단건 / PUT / DELETE 모두 성공
- [ ] 브라우저 `/consultants` 에서 목록이 보인다
- [ ] 등록 → 목록에 새 행
- [ ] 수정 → 값이 바뀐다
- [ ] 삭제 → 행이 사라진다
- [ ] `/` 상품, `/customers` 고객이 **그대로** 동작한다
- [ ] 검증 starter, `@ControllerAdvice`, 검색칸을 **넣지 않았다**

---

# Work 0. 짝 표 + 환경 (코드 없음)

## 개념

새 기능을 열기 전에 “어떤 파일이 누구의 짝인지”를 적으면, 구현 중에 층이 섞이지 않는다.

## 아주 쉽게

이사 전에 방 이름을 종이에 쓴다.  
부엌 그릇을 화장실에 두면 나중에 못 찾는다.  
Entity 는 부엌, Controller 는 현관이다.

## 라라벨로 번역

`php artisan make:model Consultant -m` 하기 전에 테이블명·라우트명을 정하는 것과 같다.

## 미션 0

1. 위 **3-B 표**의 설계사 칸을 손으로 채운다. (이 문서에 답을 적어 두지 마라. 노트에.)
2. MySQL · `./gradlew bootRun` · `GET /api/customers` 200 · 프론트 5173 상품 목록을 확인한다.
3. 노트에 API 다섯 줄을 적는다. (2-D 를 보고 베껴도 된다. 외우라는 뜻이 아니다. **눈에 한 번 쓰기**다.)

**완료 기준**

- [ ] 설계사 파일 이름이 표에 다 있다
- [ ] 서버와 기존 고객 GET 이 산다

**힌트**

- 클래스 이름은 상품/고객과 **같은 접미사**를 쓰면 길을 안 잃는다. (`*Request`, `*Service`)
- URL 은 복수형, 소문자, 하이픈. 설계사는 한 단어라 `/api/consultants` 가 자연스럽다.

---

# Work 1. Entity + Repository (DB 층)

## 개념

Entity = 테이블을 Java 로 그린 설계도.  
Repository = 그 테이블에 저장/조회/삭제 해 달라는 창구.

Repository 는 인터페이스만 있어도 된다. `JpaRepository<엔티티, 기본키타입>` 을 상속하면 `save`, `findAll`, `findById`, `deleteById`, `existsById` 가 생긴다.

## 아주 쉽게

Entity 는 출석부의 **칸 제목**이다. 이름, 사번, 전화…  
Repository 는 그 출석부를 맡아 주는 **선생님**이다.  
선생님 구현(SQL)은 Spring 이 한다. 우리는 “이 출석부 담당해 주세요” 라고만 적는다.

`employeeCode` ↔ `employee_code`, `hireDate` ↔ `hire_date`.  
Java 는 낙타, DB 는 뱀. `@Column(name = "...")` 으로 잇는다.

## 라라벨로 번역

| 여기 | 라라벨 |
|------|--------|
| `@Entity` + 필드 | Model + `$table`, `$fillable` |
| `@Id @GeneratedValue` | `$incrementing` |
| `@Column(name = "hire_date")` | 관례 또는 캐스트 |
| `JpaRepository<Consultant, Long>` | `Consultant::query()` 가 이미 있는 상태 |

## 미션 1

만들 위치 (이름은 네가 표에 적은 것):

- `src/main/java/com/yama331/restapi_crud/entity/`
- `src/main/java/com/yama331/restapi_crud/repository/`

1. `Consultant` Entity 를 스펙 2-B 대로 만든다.
2. `ConsultantRepository` 인터페이스를 만든다. **메서드 몸통 없음.**
3. 서버를 재시작하고, MySQL 에서 `consultants` 테이블이 생겼는지 확인한다.  
   (`ddl-auto=update` 가 이미 켜져 있다.)
4. 컬럼 이름이 `employee_code`, `hire_date` 인지 본다.

**완료 기준**

- [ ] 프로젝트 컴파일/기동이 된다
- [ ] `consultants` 테이블이 있다
- [ ] Repository 에 직접 SQL 을 안 썼다

**힌트**

- 옆에 둘 파일: `Customer.java`, `CustomerRepository.java`. **필드 목록은 고객이 아니다.**
- Lombok `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder` 패턴은 고객과 같다. JPA 는 기본 생성자가 필요하다.
- 날짜는 `LocalDate`, 시각은 `LocalDateTime`. 입사일은 생일과 같은 **날짜** 타입이다.
- 검색 메서드(`findByName...`) 는 만들지 마라. 다음 문서다.

---

# Work 2. DTO (JSON 계약)

## 개념

바깥(Postman, React)과 주고받는 모양은 Entity 가 아니다.

- Request: 클라이언트가 보내는 것. id / createdAt 없음.
- Response: 서버가 돌려주는 것. id / createdAt / updatedAt 있음.

Response 에 `from(entity)` 를 두면, Service 가 변환을 한곳에서 한다.

## 아주 쉽게

Entity 는 금고 안 장부다.  
손님에게는 **영수증**을 준다. 영수증에 금고 비밀번호를 안 적는다.

지금은 비밀번호가 없어도, “장부 그대로 주지 않는다” 습관을 유지한다.  
고객·상품이 이미 그렇게 했다.

## 라라벨로 번역

| 여기 | 라라벨 |
|------|--------|
| `ConsultantRequest` | FormRequest 입력 배열 |
| `ConsultantResponse` | API Resource |
| `from(entity)` | `ConsultantResource::make($model)` |

## 미션 2

1. `ConsultantRequest` — 스펙 JSON 의 칸만. id 넣지 마라.
2. `ConsultantResponse` — 스펙의 응답 칸 + `from`.
3. 노트에 적는다: “요청에 id 가 없는 이유”, “응답에 id 가 있는 이유” 각 한 문장.

**완료 기준**

- [ ] Request 필드 = name, employeeCode, phone, email, hireDate, status
- [ ] Response 에 id, createdAt, updatedAt 이 있다
- [ ] `from` 이 Entity 의 getter 와 1:1 이다

**힌트**

- JSON 키는 Java 필드 이름과 같게 (camelCase). `employeeCode`, `hireDate`.  
  프론트도 이 이름을 쓴다.
- Request 는 기본 생성자가 있어야 Jackson 이 JSON 을 객체로 만든다. 고객 DTO 를 보라.
- 검증 어노테이션(`@NotBlank`) 은 **아직 금지.**

---

# Work 3. Service (실제 일)

## 개념

Controller 는 문을 열어 주고, 일은 Service 가 한다.  
Repository 는 Service 만 부른다.

네 메서드:

| 메서드 | 할 일 |
|--------|--------|
| create | Request → Entity, status 없으면 `"재직"`, `save`, Response |
| findAll | `findAll` → 각 Entity 를 Response 로 |
| findById | 있으면 Response, 없으면 예외 |
| update | 찾아서 필드 덮기. status 가 null 이면 기존 유지 |
| delete | 없으면 예외, 있으면 `deleteById` |

`@Service`, 생성자 주입(`final` + `@RequiredArgsConstructor`), `@Transactional` 은 고객과 같다.

## 아주 쉽게

식당으로 치면:

- Controller = 홀에서 주문지 받는 사람
- Service = 요리사
- Repository = 냉장고

홀 직원이 냉장고에 손을 넣으면 주방이 엉망이 된다.

`status` 기본값은 요리사가 넣는다. “손님이 안 말하면 재직으로.”  
고객의 `"활성"` 과 같은 자리인데, **문자열 값이 다르다.**

## 라라벨로 번역

Controller 가 말라 있고, Action/Service 가 `create` 하는 구조와 같다.  
`findOrFail` ≈ `findById().orElseThrow(...)`.

## 미션 3

1. `ConsultantService` 를 만든다. CRUD 다섯 메서드.
2. `create` 에서 id, createdAt, updatedAt 을 **직접 넣지 않았는지** 확인한다.
3. `update` 는 `save` 를 안 불러도 되는지, 고객 서비스 주석의 “더티 체킹”을 읽고 결정한다. 이유를 일기에 적는다.

**완료 기준**

- [ ] Service 가 Repository 만 주입받는다
- [ ] Controller 를 아직 안 만들어도 컴파일은 된다 (안 되면 import/패키지 문제)
- [ ] status 기본값 로직이 `create` 에 있다

**힌트**

- `stream().map(ConsultantResponse::from).collect(...)` 는 고객 `findAll` 과 같은 문장이다. 뜻을 한 번 말로 설명해 보고 옮겨라.
- 예외 메시지는 `"해당 설계사가 없습니다. id=" + id` 정도면 된다.
- `@Transactional` 을 클래스에 두면 메서드들이 한 묶음으로 DB 를 만진다. 지금은 “있으면 고객과 맞춘다” 정도만 알면 된다.

---

# Work 4. Controller (HTTP 입구)

## 개념

URL + HTTP 메서드가 이 클래스에서 메서드로 연결된다.

- `@RestController` = JSON 을 주고받는 입구 (HTML 뷰 아님)
- `@RequestMapping("/api/consultants")` = 공통 접두
- `@RequestBody` = JSON → Request DTO
- `@PathVariable` = URL 의 `{id}`
- `ResponseEntity` 로 201 / 200 / 204 를 명시

계층 규칙: Controller → Service 만. Repository 직접 호출 금지.

## 아주 쉽게

현관에 적힌 안내판이다.

- “새로 등록은 이 문으로, POST”
- “명단은 GET”
- “한 사람 보려면 번호 붙여서 GET”
- “고치려면 번호 + PUT”
- “지우려면 번호 + DELETE”

안내판은 요리하지 않는다. 주방에 쪽지만 넘긴다.

## 라라벨로 번역

| 여기 | 라라벨 |
|------|--------|
| `@RequestMapping("/api/consultants")` | `Route::prefix('api/consultants')` |
| `@PostMapping` | `Route::post('/')` |
| `@PathVariable Long id` | `function show($id)` |
| `ResponseEntity.status(CREATED)` | `response()->json(..., 201)` |

## 미션 4

1. `ConsultantController` 를 스펙 2-D 대로 만든다.
2. 고객 Controller 와 **메서드 다섯 개의 시그니처**를 비교한다. 이름만 바뀌었는지 확인한다.
3. 서버를 띄운 뒤, 아직 Postman 본격 전이라 해도 `GET /api/consultants` 가 200 + `[]` 인지 한 번 친다.

**완료 기준**

- [ ] 다섯 메서드가 있다
- [ ] 빈 목록 GET 이 200 배열이다
- [ ] Controller 파일에 `ConsultantRepository` import 가 없다

**힌트**

- 등록만 `HttpStatus.CREATED`(201). 나머지는 `ok()` 또는 `noContent()`.
- 클래스에 `@RequiredArgsConstructor` + `private final ConsultantService` 패턴은 고객과 같다.
- CORS 는 `WebConfig` 가 이미 `/api/**` 를 열고 있으면 새 Controller 도 같이 열린다. 새 CORS 를 만들지 마라. 안 열리면 `WebConfig` 를 **읽기만** 하라.

---

# Work 5. Postman으로 백엔드 졸업

## 개념

화면이 실패하면 원인 후보가 두 개다. 프론트, 백엔드.  
API 를 먼저 통과시키면 후보가 하나다.

## 아주 쉽게

배관을 잠그기 전에 수도꼭지만 틀어 본다.  
물이 안 나오면 파이프 문제다. 세면대를 아직 달 필요가 없다.

## 미션 5

Postman(또는 curl)으로 **이 순서대로** 친다. 응답을 노트에 적는다.

1. `POST /api/consultants` — 스펙 JSON. 상태 **201**, body 에 `id` 가 생긴다.
2. 같은 JSON 으로 한 번 더 POST. (중복 막기는 다음 문서. 지금은 201 이 또 나와도 된다.)
3. `GET /api/consultants` — 배열 길이 확인.
4. `GET /api/consultants/{방금 id}` — 그 한 명.
5. `PUT /api/consultants/{id}` — 이름 또는 status 를 `휴직` 으로. 200, 값이 바뀜.
6. `DELETE /api/consultants/{id}` — **204**, body 없음.
7. 다시 GET 단건 — 지금은 에러여도 된다. 상태 코드만 적는다. (다음 문서에서 404 로 다듬는다.)
8. `GET /api/customers` 와 `GET /api/insurance-products` 가 여전히 200 인지.

선택 필드 확인:

9. email, hireDate, status 를 **빼고** POST. status 가 `"재직"` 인지, email 이 null 인지.

**완료 기준**

- [ ] 1, 3, 4, 5, 6 이 표의 성공 코드와 같다
- [ ] 상품·고객 GET 이 산다
- [ ] 프론트 파일을 아직 안 만들었다

**힌트**

- URL 은 `http://localhost:8080/api/consultants`. 포트 5173 이 아니다.
- Header `Content-Type: application/json` 을 빼면 서버가 body 를 못 읽는다.
- 201 이 아니라 200 이면 Controller 의 `ResponseEntity.status` 를 다시 보라.
- 테이블은 생겼는데 500 이면 `employeeCode` JSON 키와 Java 필드 이름이 다른 경우가 많다.

---

# Work 6. TypeScript 타입 + API 함수

## 개념

프론트의 타입은 백엔드 DTO 의 **쌍둥이**다. 필드 이름을 맞춘다.

- `ConsultantRequest` ↔ Java Request
- `ConsultantResponse` ↔ Java Response
- `LocalDate` / `LocalDateTime` → TypeScript 에서는 `string` (JSON 이 문자열이라서)
- 선택·null → `?` 또는 `string | null`

API 함수는 Controller 5종과 1:1.  
`axios.ts` 의 `baseURL` 을 재사용한다. 새 인스턴스를 만들지 마라.

path 앞에 `/` 를 꼭 붙인다. (`/api/consultants`)

## 아주 쉽게

백엔드가 보낸 영수증 칸 이름과, 프론트가 읽으려는 칸 이름이 같아야 한다.  
서버는 `employeeCode` 인데 프론트가 `code` 로 적으면, 화면은 빈칸이 된다. 컴파일이 성공할 수도 있다.

## 라라벨로 번역

Blade 에서는 서버가 변수를 뷰에 밀어 넣는다.  
여기서는 **네가 JSON 을 꺼내** 타입 있는 객체로 다룬다.

## 미션 6

1. `frontend/src/types/` 에 타입 파일.
2. `frontend/src/api/` 에 함수 다섯 개. 기존 `api` 인스턴스 import.
3. `get` / `post` / `put` / `delete` 의 제네릭에 Response 타입을 넣는다.
4. 삭제 함수는 `Promise<void>`. 204 라 `response.data` 를 안 써도 된다.

**완료 기준**

- [ ] Request 에 id 가 없다
- [ ] Response 의 `hireDate` 가 `string | null` 이다 (서버가 null 줄 수 있음)
- [ ] 다섯 함수의 path 가 `/api/consultants` 로 시작한다
- [ ] 화면 컴포넌트는 아직 없다

**힌트**

- 옆에 둘 파일: `types/customer.ts`, `api/customerApi.ts`.
- 사번 필드 이름을 Java 와 **한 글자라도** 다르게 쓰지 마라.
- `api.post<ConsultantResponse>('/api/consultants', data)` 형태. 상품 때 `/` 빠졌던 실수를 기억하라.

---

# Work 7. 목록 페이지

## 개념

SPA 목록의 반복:

1. 화면이 나타난다
2. `useEffect` 로 GET 한 번
3. `useState` 에 배열을 넣는다
4. `map` 으로 표 행을 그린다
5. 로딩 / 에러 / 빈 목록을 나눈다

삭제는 이 Work 에 넣어도 되고, Work 9 에 넣어도 된다.  
처음이면 **목록 + 삭제** 를 여기, 등록/수정은 다음이 덜 헷갈린다.

## 아주 쉽게

칠판에 명단을 그린다.

- 처음엔 “가져오는 중”
- 실패하면 “못 가져왔어요”
- 0명이면 “아직 없어요”
- 있으면 표

삭제 버튼은 “지울까요?” 확인 후 DELETE, 그다음 **다시 GET**.  
화면만 지우면 새로고침 때 다시 살아난다.

## 라라벨로 번역

`index` 뷰 + `@foreach`.  
차이는 서버가 HTML 을 안 주고, **네가 배열로 그린다**는 점이다.  
`useEffect(..., [])` ≈ “이 페이지 처음 열릴 때 한 번”.

## 미션 7

1. `App.tsx` 에 `/consultants` 라우트를 추가한다. 페이지가 비어 있어도 된다.
2. 목록 페이지: 로딩, 에러, 빈 목록, 표.
3. 표 컬럼: id, 이름, 사번, 전화, 입사일, 상태, (관리).
4. 상품 목록·고객 목록에서 설계사 목록으로 가는 링크를 하나씩 넣는다. 반대로도.
5. `hireDate` 가 null 이면 `-` 로 보여 준다.

**완료 기준**

- [ ] `http://localhost:5173/consultants` 가 열린다
- [ ] Postman 으로 넣어 둔 설계사가 표에 있다 (없으면 하나 POST 하고 새로고침)
- [ ] 상품·고객 화면이 안 깨진다

**힌트**

- `useState<ConsultantResponse[]>([])`, `useEffect(() => { fetch... }, [])`.
- `key={consultant.id}`.
- 라우트는 `App.tsx` 의 고객 줄을 보고 한 줄 더. `:id` 보다 `new` 를 위에 두는 관례는 고객과 같다. 지금은 목록만 있어도 된다.

---

# Work 8. 등록 페이지

## 개념

제어 컴포넌트: input 의 `value` 는 state, `onChange` 는 setState.  
제출 시 `preventDefault` — 안 하면 SPA 가 통째로 새로고침된다.

흐름:

1. 입력
2. (선택) 빈 이름/사번/전화면 프론트에서 return. 서버 검증은 다음 문서
3. `createConsultant(body)`
4. 성공하면 `navigate('/consultants')`

`hireDate` 는 `<input type="date">`. 값은 `"YYYY-MM-DD"` 문자열.  
비었으면 body 에서 빼거나 `undefined`.

## 아주 쉽게

종이 신청서를 적어 우체통(POST)에 넣는다.  
성공하면 명단 방으로 걸어간다. 건물(HTML)은 안 무너진다.

## 라라벨로 번역

`create` 뷰 + `store`.  
`@csrf` 대신 JSON. redirect 대신 `navigate`.

## 미션 8

1. 라우트 `/consultants/new`.
2. 등록 폼. 필수: 이름, 사번, 전화. 선택: 이메일, 입사일, 상태 select.
3. 목록에 “설계사 등록” 링크.
4. 성공 후 목록에서 새 행을 눈으로 확인한다.
5. 네트워크 탭에서 POST `/api/consultants` → 201 을 확인한다.

**완료 기준**

- [ ] 브라우저만으로 한 명이 추가된다
- [ ] 필수 세 칸을 비우면 최소한 프론트에서 막거나, 서버 에러가 화면에 보인다  
      (서버 `@Valid` 는 만들지 마라)
- [ ] 상품 등록 화면이 안 깨진다

**힌트**

- `CustomerCreate.tsx` 의 흐름을 따라가되, `birthDate`/`address` 를 그대로 두지 마라.
- `status` 초기값을 `'재직'` 으로 두면 select 가 비어 보이지 않는다.
- `CustomerCreate` 의 연락처 검사에 `return` 이 빠진 줄이 있다. **설계사 쪽에서는 반복하지 마라.** 고객 파일은 지금 고치지 않아도 된다.

---

# Work 9. 수정 + 삭제

## 개념

수정 화면은 등록과 거의 같고, **시작 전에 GET 단건** 이 있다.

1. URL 의 `:id` 를 `useParams` 로 읽는다
2. `getConsultant(id)` 로 input 을 채운다
3. 제출 시 `updateConsultant(id, body)` → PUT
4. 목록으로 이동

`id` 는 문자열로 온다. 숫자 API 에 넣기 전에 `Number` / `parseInt` 가 필요하다.

삭제는 목록의 버튼이면 충분하다. 확인창 → DELETE → 목록 다시 GET.

## 아주 쉽게

이미 적힌 신청서를 꺼내(GET) 고치고(PUT) 다시 넣는다.  
지울 때는 “정말요?” 한 번 묻고 서류철에서 뺀다(DELETE).

## 라라벨로 번역

`edit` + `update` + `destroy`.  
`Route::get('/consultants/{id}/edit')` ≈ `/consultants/:id/edit`.

## 미션 9

1. 라우트 `/consultants/:id/edit`. **`/consultants/new` 보다 아래**에 둔다.
2. 수정 페이지: 들어오면 값이 채워져 있다. 바꿔서 저장하면 목록에 반영.
3. 목록의 수정 링크, 삭제 버튼.
4. 없는 id (`/consultants/999999/edit`) 로 들어가 본다.  
   지금은 에러 문장이면 된다. 예쁜 404 페이지는 다음 문서.

**완료 기준**

- [ ] 이름·상태를 바꿔 저장하면 목록이 바뀐다
- [ ] 삭제 확인 후 행이 사라진다
- [ ] Network: PUT 200, DELETE 204
- [ ] 고객 수정/삭제가 여전히 된다

**힌트**

- `const { id } = useParams();` 고객 Edit 를 보라.
- date input 에 `null` 을 넣지 마라. `hireDate ?? ''`.
- `update` 의 status 를 비우면 서버가 기존 값을 유지하게 되어 있다. select 를 두면 보통 항상 문자열이 간다.

---

# Work 10. 회귀 + 스스로 설명

## 개념

새 방이 생기면 옛 방 문이 닫히지 않았는지 걸어 본다.  
그리고 **코드를 안 보고** 층을 말로 설명할 수 있어야 3번째 CRUD 의 의미가 있다.

## 미션 10

브라우저에서 직접:

1. 상품 등록 → 목록 → 수정 → 삭제 (또는 삭제 대신 수정만)
2. 고객 등록 → 목록 → 수정
3. 설계사 등록 → 목록 → 수정 → 삭제
4. 세 목록 페이지가 서로 링크로 오갈 수 있다

노트 (코드 닫고):

5. “등록 버튼부터 DB 까지” 층을 입으로 말한다. 막히는 층 이름을 적는다.
6. Entity 를 API 에 안 주는 이유를 한 문장.
7. 프론트 `useEffect` 가 하는 일을 한 문장.

**완료 기준**

- [ ] 위 클릭 회귀가 통과
- [ ] 5~7 을 노트에 씀
- [ ] 검증·검색·Advice 코드를 넣지 않았다

이 칸이 다 채워지면 이 문서는 끝이다.  
다음 문은 `docs/07_REST_CONTRACT_MISSION.md` 다. 거기는 새 테이블이 없다.

---

# 부록 A. Work 순서와 시간

| Work | 주제 | 대략 |
|------|------|------|
| 0 | 표 + 환경 | 20분 |
| 1 | Entity + Repository | 30~40분 |
| 2 | DTO | 30분 |
| 3 | Service | 40분 |
| 4 | Controller | 30분 |
| 5 | Postman | 30분 |
| 6 | TS + api | 30분 |
| 7 | 목록 | 40분 |
| 8 | 등록 | 40분 |
| 9 | 수정·삭제 | 40분 |
| 10 | 회귀·설명 | 20분 |

백엔드(1~5)를 하루, 프론트(6~10)를 하루로 나눠도 된다.  
**5를 건너뛰고 7로 가지 마라.**

---

# 부록 B. 막히면

좋은 질문:

- “테이블은 생겼는데 POST 가 500 입니다. Request 필드명을 같이 봐 주실래요?”
- “목록은 되는데 등록 후 이동이 안 됩니다. navigate 위치를 봐 주실래요?”
- “상품 목록이 갑자기 안 열려요. App.tsx 라우트를 같이 보죠.”

나쁜 질문 (이 문서에서는 코드 없음):

- “ConsultantService 완성본 주세요”
- “페이지 세 개 그냥 짜 주세요”

참고로 **열어도 되는 기존 파일** (한 층만):

- 같은 층의 고객 파일
- `App.tsx` (라우트 추가)
- `WebConfig.java` (CORS 가 의심될 때만 읽기)

참고로 **지금 열지 않는 문서**:

- `07_REST_CONTRACT_MISSION.md` — 다음 순환
- `05_CUSTOMER_CRUD_MANUAL.md` 의 긴 코드 블록 — 베끼게 된다

---

# 부록 C. 다음 문서와의 경계

| 지금 (이 문서) | 다음 (`07_REST_CONTRACT_MISSION.md`) |
|----------------|----------------------------------|
| 행복 경로 CRUD | 빈 값 400, 없는 id 404, 중복 409 |
| `findAll` 만 | `?name=` 검색 |
| 프론트 고정 에러 문장도 허용 | 서버 JSON 을 화면에 |
| 설계사 새 테이블 | 새 테이블 없음. 있는 API 를 다듬음 |

설계사에 `@NotBlank` 를 먼저 달고 싶어져도 **참는다.**  
다음 문서가 그 자리를 수업으로 쓰기 때문이다.
