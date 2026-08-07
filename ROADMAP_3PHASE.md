# restapi_crud 3단계 로드맵 가이드

> **대상**: Laravel은 써 봤고, React + Spring Boot REST는 처음인 사람  
> **프로젝트**: 보험상품 관리 연습용 CRUD (`restapi_crud`)  
> **문서 목적**: 1~3단계를 **왜 / 무엇을 / 어떤 순서로 / 어떻게** 할지 초보자 기준으로 정리  
> **관련 문서**: `PROJECT.md`(개요), `CRUD_LEARNING_GUIDE.md`(현재 코드 검토·CRUD 학습), **`docs/PHASE1_DESIGN.md`(1단계 상세 설계서)**

---

## 0. 전체 그림 (한 장으로 보기)

```
┌─────────────────────────────────────────────────────────────┐
│  1단계 (지금)                                                │
│  상품 등록 / 수정 / 삭제 UI 완성                              │
│  → “프론트엔드에서 CRUD를 끝까지 손으로 해보기”                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ 기반이 단단해진 뒤
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  2단계                                                       │
│  User 테이블 + 회원가입 / 로그인 (인증)                        │
│  → “로그인한 사람만 상품을 관리할 수 있게”                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ 누가 요청했는지 알 수 있게 된 뒤
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  3단계                                                       │
│  구매(주문) 기능                                              │
│  → “누가 어떤 상품을 샀는지” 기록                             │
└─────────────────────────────────────────────────────────────┘
```

| 단계 | 한 줄 목표 | 새로 배우는 핵심 |
|------|------------|------------------|
| **1단계** | 브라우저만으로 상품 C/R/U/D | React 폼, 라우팅, 목록 갱신 |
| **2단계** | 로그인 사용자만 관리 | 비밀번호 해시, 세션/JWT, 보호 API |
| **3단계** | 주문(구매) 기록 | 테이블 관계(FK), 트랜잭션 감각 |

### 왜 이 순서인가?

| 순서 | 이유 |
|------|------|
| 1 → 2 | 인증을 먼저 붙이면 “상품 CRUD 버그인지, 로그인 버그인지” 구분이 어려움. **화면·API 흐름을 먼저 익힌다.** |
| 2 → 3 | 주문은 “**누가** 샀는지”가 필요함. User 없이 주문을 만들면 나중에 전부 뜯어고치게 됨. |
| 3을 1 직후에 안 하는 이유 | 관계형 데이터(User–Order–Product)는 인증·유저 개념이 잡힌 뒤가 훨씬 쉽다. |

### 절대 한 번에 하지 말 것

- 1단계에서 로그인까지 같이 만들기  
- 2단계에서 결제(카드/PG)까지 붙이기  
- 3단계에서 배송·환불·정산까지 확장  

**한 단계 = 한 가지 큰 능력.**  
끝나기 전에 다음 단계 코드를 섞지 않는 것이 초보에게 가장 중요하다.

---

## 1. 지금 프로젝트 상태 (출발점)

### 이미 있는 것

| 영역 | 상태 |
|------|------|
| 백엔드 Entity / Repository / DTO / Service / Controller | 상품 CRUD API 완료 |
| CORS | 프론트(5173) 허용 |
| 프론트 타입 + API 함수 | 준비됨 (등록 path `/` 수정 권장) |
| 프론트 화면 | **목록 조회만** 완료 |

### 1단계에서 채울 것

- 등록 UI, 수정 UI, 삭제 UI  
- (권장) 페이지 라우팅  
- 브라우저만으로 CRUD 확인  

### 2·3단계에서 새로 생길 것 (미리 개념만)

```
users          ← 2단계
insurance_products  ← 이미 있음 (1단계 계속 사용)
orders (또는 purchases)  ← 3단계
  - user_id
  - product_id
  - 구매일시, 상태 등
```

---

# 1단계 — 상품 등록 / 수정 / 삭제 UI 완성

> **상세 설계서 (테이블·API·화면·플로우·WBS·테스트)**: [`docs/PHASE1_DESIGN.md`](./docs/PHASE1_DESIGN.md)

## 1-1. 목표 (이게 되면 “1단계 끝”)

브라우저(`http://localhost:5173`)에서 **Postman 없이** 다음이 된다.

1. 상품 **목록** 보기  
2. 상품 **등록** 후 목록에 나타남  
3. 상품 **수정** 후 값이 바뀜  
4. 상품 **삭제** 후 목록에서 사라짐  
5. 로딩 중 / 실패 시 사용자에게 안내  

백엔드 API는 **이미 있다.**  
이 단계의 본질은 **프론트가 API를 호출하고 화면 상태를 다루는 연습**이다.

## 1-2. 백엔드에서 손댈 일 (최소)

| 작업 | 필수? | 설명 |
|------|-------|------|
| API 5종 동작 확인 | ✅ | curl/Postman으로 C/R/U/D 확인 |
| `createInsuranceProduct` 경로 `/` 수정 | ✅ | 프론트 버그 예방 |
| 입력 검증 (`@NotBlank` 등) | 권장 | 없어도 UI는 만들 수 있음 |
| 없는 id → 404 | 권장 | 없어도 UI는 만들 수 있음 |
| User / 로그인 코드 | ❌ | **2단계** |

> 1단계 원칙: **백엔드를 크게 바꾸지 말고, 있는 API에 화면만 붙인다.**

### 작업 전 API 점검 (5분)

```bash
# 목록
curl http://localhost:8080/api/insurance-products

# 등록
curl -X POST http://localhost:8080/api/insurance-products \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트종신","company":"삼성생명","type":"종신","monthlyPremium":50000}'
```

목록·등록이 되면 프론트 작업을 시작한다.

### 프론트 즉시 수정

`frontend/src/api/insuranceProductApi.ts`

```ts
// 잘못된 예
api.post('api/insurance-products', data)

// 올바른 예 (다른 함수와 동일하게 앞에 /)
api.post('/api/insurance-products', data)
```

## 1-3. 권장 화면 구성

초보는 **한 페이지에 모든 걸 몰아넣지 말고**, 역할별로 나누는 편이 쉽다.  
`react-router-dom` 은 이미 설치되어 있다.

| 경로 | 페이지 | 하는 일 |
|------|--------|---------|
| `/` | 목록 | 표 + “등록” 링크 + 각 행의 수정/삭제 |
| `/products/new` | 등록 폼 | 입력 → POST → 목록으로 이동 |
| `/products/:id/edit` | 수정 폼 | GET으로 채움 → PUT → 목록으로 이동 |

```
frontend/src/
├── api/
│   ├── axios.ts
│   └── insuranceProductApi.ts      ← 이미 있음 (path 수정)
├── types/
│   └── insuranceProduct.ts         ← 이미 있음
├── pages/
│   ├── InsuranceProductList.tsx    ← 이미 있음 (버튼 추가)
│   ├── InsuranceProductCreate.tsx  ← 새로 만들기
│   └── InsuranceProductEdit.tsx    ← 새로 만들기
├── App.tsx                         ← Router 연결
└── main.tsx
```

> 등록/수정을 **한 폼 컴포넌트**로 합쳐도 된다.  
> 처음이면 **Create / Edit 파일 둘**로 나누는 쪽이 디버깅이 쉽다. 익숙해지면 합친다.

## 1-4. 작업 순서 (반드시 이 순서로)

초보가 막히는 가장 큰 이유는 **등록·수정·삭제를 하루에 전부** 하려는 것이다.  
**기능 하나씩** 끝낸 뒤에 다음으로 간다.

```
① 등록 path 수정 + API curl 확인
      ↓
② 라우터 뼈대 (빈 페이지라도 / , /products/new 연결)
      ↓
③ Create UI (등록만)
      ↓
④ Delete UI (목록에 삭제 버튼만)
      ↓
⑤ Edit UI (수정)
      ↓
⑥ 다듬기 (에러 메시지, 빈 값 체크, UX)
```

### ① 등록 path + API 확인

- 위 표의 path 수정  
- curl로 POST/GET/PUT/DELETE 한 번씩  

**완료 기준**: 터미널만으로 CRUD가 된다.

### ② 라우터 뼈대

`App.tsx` 예시 개념:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InsuranceProductList from './pages/InsuranceProductList';
import InsuranceProductCreate from './pages/InsuranceProductCreate';
import InsuranceProductEdit from './pages/InsuranceProductEdit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InsuranceProductList />} />
        <Route path="/products/new" element={<InsuranceProductCreate />} />
        <Route path="/products/:id/edit" element={<InsuranceProductEdit />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**완료 기준**: 주소창에 경로를 치면 각 페이지(일단 제목만 있어도 됨)가 열린다.

### ③ Create UI — 가장 중요한 연습

**화면 흐름**

```
[등록 페이지]
  입력 폼 (name, company, type, monthlyPremium, description, status)
      ↓ 제출
  createInsuranceProduct(data)
      ↓ 성공
  목록 페이지로 이동 (navigate('/'))
      ↓ 실패
  빨간 에러 문구 표시
```

**state 패턴 (목록에서 쓰던 것과 동일)**

| state | 용도 |
|-------|------|
| form 필드들 | 입력값 |
| `loading` | 제출 중 버튼 비활성 |
| `error` | 실패 메시지 |

**초보 체크리스트**

- [ ] controlled input (`value` + `onChange`)  
- [ ] `type="number"` 인 보험료는 서버로 보낼 때 **number** 로 보내기  
- [ ] 제출 중 더블클릭 방지 (`loading` 이면 button disabled)  
- [ ] 성공 후 `navigate('/')`  
- [ ] Network 탭에서 POST `/api/insurance-products` 가 **201** 인지 확인  

**완료 기준**: 화면에서 상품을 추가하면 목록에 보인다.

### ④ Delete UI

**화면 흐름**

```
[목록 행] 삭제 버튼
      ↓
  confirm("정말 삭제할까요?")
      ↓ 예
  deleteInsuranceProduct(id)
      ↓ 성공
  목록 다시 불러오기 (getInsuranceProducts)
```

**팁**

- 실수로 지우지 않게 `window.confirm` 정도는 넣기  
- 삭제 후 **목록 state를 다시 fetch** 하는 방식이 가장 단순하고 안전함  

**완료 기준**: 화면에서 지우면 표에서 사라진다.

### ⑤ Edit UI

**화면 흐름**

```
[목록] 수정 링크 → /products/1/edit
      ↓
  useParams 로 id 꺼내기
      ↓
  getInsuranceProduct(id) 로 폼 채우기
      ↓ 제출
  updateInsuranceProduct(id, data)
      ↓ 성공
  navigate('/')
```

**초보가 자주 하는 실수**

| 실수 | 해결 |
|------|------|
| 폼이 비어 있음 | 마운트 시 GET을 안 함 / `useEffect` 누락 |
| id가 undefined | `useParams` 타입, Route path `:id` 확인 |
| 수정해도 목록이 예전 값 | 목록으로 간 뒤 목록이 다시 fetch 하는지 확인 |

**완료 기준**: 화면에서 고친 내용이 목록에 반영된다.

### ⑥ 다듬기 (1단계 마무리)

| 항목 | 설명 |
|------|------|
| 프론트 간단 검증 | 이름 비어 있으면 제출 막기 |
| 에러 표시 | API 실패 시 `error` state로 문구 |
| 목록 헤더 | “상품 등록” 버튼 → `/products/new` |
| (선택) 서버 검증 | Request DTO에 validation 어노테이션 |

## 1-5. 1단계 완료 체크리스트

- [ ] curl/Postman으로 API CRUD 확인  
- [ ] 등록 API path `/` 수정  
- [ ] 라우팅: 목록 / 등록 / 수정  
- [ ] 등록 → 목록 반영  
- [ ] 수정 → 목록 반영  
- [ ] 삭제 → 목록 반영  
- [ ] loading / error 처리  
- [ ] (권장) 빈 입력 방지  

**여기까지 되면 1단계 졸업.**  
그 전에는 2단계(로그인) 코드를 넣지 말 것.

## 1-6. 1단계에서 일부러 안 하는 것

- 로그인 / 회원가입  
- “내 상품만 보기”  
- 예쁜 CSS 프레임워크 도입 (동작 우선, 인라인 스타일도 OK)  
- 페이지네이션, 검색 (있으면 좋지만 **필수는 아님**)

---

# 2단계 — User + 회원가입 / 로그인 (인증)

## 2-1. 목표 (이게 되면 “2단계 끝”)

1. 사용자를 DB에 **가입**시킬 수 있다.  
2. **로그인**하면 “지금 누구인지” 서버가 알 수 있다.  
3. **로그아웃**할 수 있다.  
4. **로그인하지 않으면** 상품 등록/수정/삭제 API·화면을 쓸 수 없다.  
5. (권장) 목록 조회는 공개 / 관리는 로그인 필요 — 정책은 아래에서 고른다.

## 2-2. 왜 2단계가 필요한가?

1단계 API는 주소만 알면 **누구나** Postman으로 상품을 지울 수 있다.  
2단계는 그 구멍에 **자물쇠**를 다는 단계다.

```
[1단계]
  아무나 → POST/PUT/DELETE 상품   (연습용, 열려 있음)

[2단계]
  로그인 안 함 → 관리 API 거부 (401)
  로그인 함   → 관리 API 허용
```

3단계 “누가 샀는지”를 하려면 **사용자 식별**이 먼저 필요하다.

## 2-3. 초보에게 권하는 인증 방식

실무에는 여러 방식이 있다. **연습 프로젝트에서는 하나를 고르고 깊게** 가는 것이 좋다.

| 방식 | 난이도 | 특징 | 추천 |
|------|--------|------|------|
| **세션 + 쿠키** | 중 | Spring Security 기본 감각, 서버가 로그인 상태 보관 | Laravel 세션과 비슷해서 진입 쉬움 |
| **JWT (토큰)** | 중~상 | 프론트가 토큰 저장·헤더 첨부, 모바일/SPA에 흔함 | SPA 학습용으로 많이 선택 |
| 직접 세션 구현 (Security 없이) | 하~중 | 원리는 보이지만 실무와 거리 | 개념 학습용 |

### 이 문서의 권장 (선택지)

**연습 목표 = “로그인 사용자만 상품 관리”** 라면 아래 중 하나:

- **A안 (추천·실무 감각)**: Spring Security + **세션 쿠키** + CORS credentials  
- **B안 (SPA에서 흔함)**: Spring Security + **JWT** + `Authorization: Bearer ...`

둘 다 “비밀번호는 해시로 저장”, “보호된 API”, “프론트 로그인 화면” 흐름은 같다.  
**한 가지를 처음부터 끝까지** 구현한다. 중간에 A↔B 섞지 말 것.

> Laravel 경험자 메모  
> - `Auth::attempt` ≈ 로그인 처리  
> - `auth` 미들웨어 ≈ Spring Security 필터 / 인가 설정  
> - `bcrypt` 비밀번호 ≈ `BCryptPasswordEncoder`

## 2-4. 데이터 설계 (User)

최소 컬럼만으로 시작한다. (과설계 금지)

| 컬럼 | 타입 예시 | 설명 |
|------|-----------|------|
| `id` | BIGINT PK | 기본키 |
| `email` | VARCHAR, UNIQUE | 로그인 ID로 사용 (또는 username) |
| `password` | VARCHAR | **평문 저장 금지**, BCrypt 해시만 |
| `name` | VARCHAR | 표시 이름 |
| `created_at` | datetime | 가입 시각 |

**하지 말 것**

- 주민번호, 주소, 프로필 사진 URL 등 지금 불필요한 필드  
- “관리자/일반” 역할을 1단계 인증과 동시에 복잡하게 (역할은 나중에)

### 패키지 추가 예상 (백엔드)

```
entity/User.java
repository/UserRepository.java
dto/SignupRequest.java, LoginRequest.java, UserResponse.java ...
service/UserService.java (또는 AuthService)
controller/AuthController.java
config/SecurityConfig.java   ← 2단계 핵심
```

## 2-5. API 설계 초안

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| `POST` | `/api/auth/signup` | 회원가입 | 불필요 |
| `POST` | `/api/auth/login` | 로그인 | 불필요 |
| `POST` | `/api/auth/logout` | 로그아웃 | 필요 (또는 토큰 폐기 정책) |
| `GET` | `/api/auth/me` | 내 정보 | 필요 |
| `GET` | `/api/insurance-products` | 목록 | **정책 선택** (아래) |
| `POST/PUT/DELETE` | `/api/insurance-products...` | 관리 | **로그인 필수** |

### 상품 API 공개 범위 정책 (하나 고르기)

| 정책 | 목록 조회 | 등록·수정·삭제 | 초보 추천 |
|------|-----------|----------------|-----------|
| **관리 앱 스타일** | 로그인 필요 | 로그인 필요 | 구현 단순 |
| **쇼핑몰 스타일** | 공개 | 로그인 필요 | 3단계(구매)와 자연스러움 |

3단계가 “구매”라면 **쇼핑몰 스타일(목록 공개, 관리는 로그인)** 이 이야기에 잘 맞는다.  
다만 2단계 연습만 보면 **전부 로그인 필수**가 구현이 더 쉽다.

**제안**: 2단계 초반에는 “상품 전체 API 로그인 필수”로 잠그고,  
3단계 들어가기 직전에 목록 GET만 공개로 풀어도 된다.

## 2-6. 작업 순서 (2단계 전용)

```
① User Entity + Repository + 테이블 생성 확인
      ↓
② 비밀번호 해시 가입 API (signup) — 로그인 없이
      ↓
③ 로그인 API + “현재 사용자” 확인 (/me)
      ↓
④ 상품 관리 API 보호 (인증 안 되면 401)
      ↓
⑤ 프론트: 가입 / 로그인 페이지
      ↓
⑥ 프론트: 토큰 또는 쿠키 저장 + axios 설정
      ↓
⑦ 프론트: 비로그인 시 관리 페이지 접근 차단 (라우트 가드)
      ↓
⑧ 로그아웃 + 헤더에 “홍길동님 / 로그아웃”
```

### ① User Entity

- `InsuranceProduct` 만들 때와 **같은 패턴**  
- email unique  
- password 필드는 응답 DTO에 **절대 넣지 않기**

**완료 기준**: 앱 실행 후 `users` 테이블이 생긴다 (`ddl-auto=update`).

### ② 회원가입

```
클라이언트 → { email, password, name }
서버
  1) email 중복 검사
  2) password 를 BCrypt 로 해시
  3) User 저장
  4) 비밀번호 없는 UserResponse 반환
```

**완료 기준**: DB에 password가 `$2a$...` 형태 해시로 들어간다. 평문이면 실패.

### ③ 로그인 + 나 조회

- 이메일/비밀번호 검증  
- 세션 생성 **또는** JWT 발급  
- `GET /api/auth/me` 로 “로그인된 사용자” 확인  

**완료 기준**: 로그인 후 `/me` 가 200 + 내 정보, 로그아웃(또는 토큰 없이)이면 401.

### ④ 상품 API 보호

- Security 설정에서 `/api/insurance-products/**` 의 POST/PUT/DELETE 는 인증 필요  
- 인증 없이 호출 시 **401 Unauthorized**

**완료 기준**: Postman에서 로그인 없이 DELETE → 401, 로그인 후 → 204.

### ⑤⑥ 프론트 인증 UI + axios

| 파일 예시 | 역할 |
|-----------|------|
| `pages/Login.tsx` | 로그인 폼 |
| `pages/Signup.tsx` | 가입 폼 |
| `api/authApi.ts` | signup / login / logout / me |
| `api/axios.ts` | JWT면 요청 헤더에 토큰, 세션이면 `withCredentials: true` |
| (선택) `auth/AuthContext.tsx` | 전역 “지금 로그인 유저” 상태 |

**JWT를 고른 경우 초보 포인트**

- 로그인 응답의 token을 `localStorage`(연습) 또는 메모리에 저장  
- axios 인터셉터로 `Authorization: Bearer {token}` 자동 첨부  
- 401 나오면 로그인 페이지로 보내기  

**세션 쿠키를 고른 경우 초보 포인트**

- axios `withCredentials: true`  
- 백엔드 CORS `allowCredentials(true)` + **allowedOrigins에 `*` 사용 불가** (이미 origin 지정됨)  
- 프론트·백 포트가 달라도 쿠키가 오가게 설정 맞추기  

### ⑦ 라우트 가드

```
비로그인 사용자가 /products/new 접속
  → /login 으로 보내기
로그인 후 원래 가려던 페이지로 돌아가면 더 좋음 (나중에)
```

### ⑧ UX 마무리

- 헤더: 로그인 시 이름 + 로그아웃  
- 로그인 시 로그인/가입 링크 숨기기  

## 2-7. 2단계 완료 체크리스트

- [ ] users 테이블 + 가입 시 비밀번호 해시 저장  
- [ ] 로그인 / 로그아웃 / 내 정보  
- [ ] 상품 관리 API는 비로그인 시 401  
- [ ] 프론트 가입·로그인 화면  
- [ ] axios가 인증 정보를 자동으로 실어 보냄  
- [ ] 비로그인 사용자는 관리 UI 진입 불가  
- [ ] 로그인 사용자는 1단계에서 만든 CRUD UI를 **그대로** 사용 가능  

## 2-8. 2단계에서 일부러 안 하는 것

- 소셜 로그인 (구글/카카오)  
- 이메일 인증 메일 발송  
- 비밀번호 재설정 메일  
- 세분화된 역할(관리자만 삭제 등) — 필요하면 2단계 **끝 후** 작은 확장  
- 결제  

## 2-9. 막힐 때 디버깅 순서 (인증 전용)

1. **가입** 직후 DB password가 해시인지  
2. **로그인 API**만 Postman으로 성공하는지  
3. **보호 API**를 인증 없이 → 401 인지  
4. 인증 **후** 같은 API → 200/201/204 인지  
5. 그 다음에야 프론트 Network 탭 (쿠키/헤더가 실리는지)

프론트부터 고치면 원인 분리가 안 된다.

---

# 3단계 — 구매(주문) 기능

## 3-1. 목표 (이게 되면 “3단계 끝”)

1. 로그인한 사용자가 상품을 **구매(주문)** 할 수 있다.  
2. DB에 **누가 / 어떤 상품을 / 언제** 샀는지 남는다.  
3. **내 주문 목록**을 볼 수 있다.  
4. (권장) 관리 관점에서 **전체 주문 목록** 또는 상품별 판매 이력 조회  

**결제 PG, 카드 승인, 환불 시스템까지는 범위 밖.**  
“주문 기록(누가 무엇을)” 이 핵심이다.

## 3-2. 왜 2단계 다음인가?

```
주문(Order) = User  +  InsuranceProduct  +  시점/상태
               ↑              ↑
            2단계에서 만든 것   1단계에서 만든 것
```

User 없이 “guest 구매”만 만들면 3단계 학습 포인트(관계)가 약해진다.

## 3-3. 데이터 설계 (최소)

### 테이블 이름 예시: `orders` 또는 `purchases`

| 컬럼 | 설명 |
|------|------|
| `id` | 주문 PK |
| `user_id` | 구매자 (FK → users) |
| `product_id` | 구매 상품 (FK → insurance_products) |
| `price_at_purchase` | 구매 당시 가격 (상품 가격이 나중에 바뀌어도 기록 유지) |
| `status` | 예: `ORDERED`, `CANCELLED` (처음엔 `ORDERED`만) |
| `created_at` | 주문 시각 |

### 관계 그림

```
users 1 ──── * orders * ──── 1 insurance_products
       “한 사람이 여러 주문”     “한 상품이 여러 번 주문될 수 있음”
```

### 초보가 피해야 할 과설계

| 지금은 안 함 | 이유 |
|--------------|------|
| 주문 상세 라인 여러 개 (장바구니 여러 상품) | 1주문 1상품으로 충분 |
| 배송지, 송장 | 보험 상품 연습과 거리 있음 |
| 재고 차감 | 보험 상품은 재고 개념이 약함 |
| 부분 환불, 정산 | 범위 폭발 |

**규칙: 한 번의 구매 API = 한 명의 유저가 한 상품 하나 주문.**

## 3-4. API 설계 초안

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| `POST` | `/api/orders` | 주문 생성 body: `{ "productId": 1 }` | 로그인 필수 |
| `GET` | `/api/orders/me` | 내 주문 목록 | 로그인 필수 |
| `GET` | `/api/orders/{id}` | 내 주문 단건 (남의 주문이면 403) | 로그인 필수 |
| `POST` | `/api/orders/{id}/cancel` | (선택) 취소 | 로그인 필수 |
| `GET` | `/api/orders` | (선택) 전체 주문 — 관리용 | 로그인 필수 |

### 주문 생성 로직 (Service에서)

```
1. 현재 로그인 사용자 가져오기  (Security / JWT subject)
2. productId 로 상품 조회       (없으면 404)
3. (선택) 상품 status 가 "판매중" 인지 확인
4. Order 엔티티 생성
     - user = 현재 사용자
     - product = 조회한 상품
     - priceAtPurchase = 상품의 monthlyPremium (또는 별도 가격 필드)
     - status = ORDERED
5. 저장 후 OrderResponse 반환
```

**중요**: `userId` 를 클라이언트 body로 믿지 말 것.  
**서버가 로그인 정보에서 user를 꺼낸다.** (위조 방지)

## 3-5. 프론트 화면 초안

| 화면 | 설명 |
|------|------|
| 상품 목록/상세 | “구매하기” 버튼 (로그인 필요) |
| 내 주문 목록 | `/orders` — 내가 산 상품, 일시, 상태 |
| (선택) 관리자 주문 목록 | 나중에 |

**구매 버튼 흐름**

```
[상품 목록/상세] 구매
      ↓ 비로그인
  로그인 페이지로
      ↓ 로그인됨
  POST /api/orders { productId }
      ↓ 성공
  “구매 완료” + 내 주문 목록으로 이동
```

## 3-6. 작업 순서 (3단계 전용)

```
① Order Entity + Repository (User, Product 연관관계)
      ↓
② OrderService.create — 로그인 유저 + productId
      ↓
③ POST /api/orders , GET /api/orders/me
      ↓
④ Postman으로 “유저A 로그인 → 주문 → 내 목록” 확인
      ↓
⑤ 프론트: 구매 버튼 + 내 주문 페이지
      ↓
⑥ (선택) 취소, 상품 상태 체크, 가격 스냅샷 검증
```

### JPA 연관관계 초보 가이드

```text
Order
  @ManyToOne User user
  @ManyToOne InsuranceProduct product
```

- 처음에는 **Lazy 로딩** 기본값으로 두고,  
  응답 DTO에는 필요한 필드만 직접 넣기 (`userName`, `productName` …).  
- Entity를 그대로 JSON으로 반환하면 순환 참조(User→Order→User…)로 터지기 쉽다.  
  → **1단계와 같이 반드시 Response DTO 사용.**

## 3-7. 3단계 완료 체크리스트

- [ ] orders 테이블 + user_id, product_id  
- [ ] 로그인 사용자만 주문 가능  
- [ ] body의 userId가 아니라 **서버 로그인 정보**로 구매자 결정  
- [ ] 구매 시점 가격 저장  
- [ ] 내 주문 목록 API + 화면  
- [ ] 상품 화면에서 구매 버튼 동작  
- [ ] (권장) 다른 사람 주문 단건 조회 시 403  

## 3-8. 3단계에서 일부러 안 하는 것

- 실제 결제(카드, 카카오페이 등)  
- 장바구니에 여러 상품  
- 배송 추적  
- 정산·수수료  
- 추천 상품 AI  

“기록된다 = 학습 성공”으로 끝낸다. 결제는 별도 프로젝트 주제다.

---

# 공통: 초보자가 일하는 방법

## A. 한 번에 하나의 “세로 슬라이스”

나쁜 예:

> Entity 전부 만들고 → API 전부 만들고 → 화면 전부 만들기  

좋은 예 (세로로 얇게):

> **가입 API 하나** → Postman 확인 → **가입 화면 하나** → 동작 확인 → 다음 기능  

| 단계 | 한 슬라이스 예시 |
|------|------------------|
| 1 | “등록 폼 → POST → 목록 반영” 만 |
| 2 | “회원가입 API + 가입 화면” 만 |
| 3 | “주문 생성 API + 구매 버튼” 만 |

## B. 백엔드 먼저, 프론트 나중 (기능 단위)

```
1) API를 curl/Postman으로 성공시킨다
2) 프론트 버튼을 그 API에 연결한다
3) Network 탭으로 요청/응답을 본다
```

프론트만 만지다가 “백이 잘못된 건지” 모르게 되는 상황을 줄인다.

## C. 디버깅 순서 (공통)

1. 서버 로그 / 예외 메시지  
2. DB에 데이터가 기대한 대로인지  
3. Postman으로 동일 요청  
4. 브라우저 Network (URL, method, status, request payload, response)  
5. 그다음 React state  

## D. 커밋 습관

기능이 작아도 **동작하는 단위**로 커밋한다.

```
feat: 상품 등록 폼 연동
feat: 상품 삭제 버튼
feat: 회원가입 API
feat: 로그인 후 상품 API 보호
feat: 주문 생성 및 내 주문 목록
```

한 커밋에 1+2+3단계를 섞지 않는다.

## E. 문서·주석

- 주석은 “이 코드가 뭐 하는지”보다 **왜 이렇게 했는지**  
- 막혔던 점 한 줄 메모 (`TROUBLESHOOTING.md` 또는 이 문서 하단에 추가) 추천  

## F. 시간 배분 감 (참고)

사람마다 다르지만, **첫 REST 연습** 기준 감각:

| 단계 | 대략 |
|------|------|
| 1단계 UI CRUD | 수일 ~ 1주 |
| 2단계 인증 | 1주 전후 (Security 처음이면 더 걸릴 수 있음) |
| 3단계 주문 | 수일 (1·2가 탄탄하면 짧아짐) |

막히면 기능을 줄인다. “취소 없는 주문만”, “역할 없는 로그인만” 이 정답에 가깝다.

---

# 단계별 “시작 전 / 끝난 후” 요약표

| 단계 | 시작 조건 | 핵심 산출물 | 끝 조건 |
|------|-----------|-------------|---------|
| **1** | 상품 REST API 동작 | 등록·수정·삭제 UI + 라우팅 | 브라우저만으로 상품 CRUD |
| **2** | 1단계 완료 | User, 가입/로그인, API 보호 | 비로그인 관리 불가, 로그인 후 CRUD 가능 |
| **3** | 2단계 완료 | Order, 구매 API, 내 주문 화면 | “누가 어떤 상품을 샀는지” DB·화면 확인 |

---

# 전체 아키텍처 진화

### 1단계 끝

```
React ──JSON──▶ InsuranceProduct API ──▶ MySQL (insurance_products)
```

### 2단계 끝

```
React ──JSON + 인증──▶ Auth API
                    └▶ InsuranceProduct API (보호) ──▶ MySQL (users, insurance_products)
```

### 3단계 끝

```
React ──인증──▶ Auth
             ├▶ Products (조회 공개 / 관리 보호)
             └▶ Orders (로그인 유저의 구매) ──▶ MySQL
                    users
                    insurance_products
                    orders (user_id, product_id, ...)
```

---

# 추천 학습 포인트 체크 (단계가  ent길 때)

각 단계가 끝날 때 **말로 설명할 수 있으면** 통과다.

### 1단계 후

- [ ] Controller / Service / Repository 역할을 구분해서 말할 수 있다  
- [ ] Entity와 DTO를 나누는 이유를 안다  
- [ ] React에서 loading / error / 성공 데이터를 나눈다  
- [ ] 등록 후 목록이 갱신되는 흐름을 설명한다  

### 2단계 후

- [ ] 비밀번호를 평문으로 저장하면 안 되는 이유를 안다  
- [ ] 401이 언제 나오는지 안다  
- [ ] 프론트가 매 요청에 인증 정보를 실는 방법을 안다  
- [ ] “API 보호”와 “화면 숨기기”는 다르다는 것을 안다  
  - 화면만 숨기면 Postman으로 뚫림 → **서버 보호가 진짜 보안**

### 3단계 후

- [ ] FK로 테이블이 연결되는 이유를 안다  
- [ ] 주문 시 userId를 클라이언트가 보내면 안 되는 이유를 안다  
- [ ] 구매 당시 가격을 복사해 두는 이유를 안다  
- [ ] Entity 직접 반환 시 관계 때문에 생기는 문제를 안다  

---

# 다음에 열어볼 파일 (현재 프로젝트)

| 목적 | 경로 |
|------|------|
| 상품 Entity | `src/main/java/.../entity/InsuranceProduct.java` |
| 상품 API | `src/main/java/.../controller/InsuranceProductController.java` |
| 상품 서비스 | `src/main/java/.../service/InsuranceProductService.java` |
| FE API | `frontend/src/api/insuranceProductApi.ts` |
| FE 목록 | `frontend/src/pages/InsuranceProductList.tsx` |
| CORS | `src/main/java/.../config/WebConfig.java` |
| 1단계 상세 학습 | `CRUD_LEARNING_GUIDE.md` |

2·3단계에서 새로 생길 위치는 기존 패키지 규칙을 그대로 따르면 된다.

```
entity/User.java, entity/Order.java
repository/...
dto/...
service/AuthService.java, OrderService.java
controller/AuthController.java, OrderController.java
config/SecurityConfig.java
frontend/src/pages/Login.tsx, Signup.tsx, MyOrders.tsx
frontend/src/api/authApi.ts, orderApi.ts
```

---

# 마무리

| 단계 | 한 문장 |
|------|---------|
| **1단계** | 이미 있는 상품 API에 **화면을 붙여** CRUD를 손으로 끝낸다. |
| **2단계** | **User와 로그인**으로 “누구인지”를 알게 하고, 관리 API에 자물쇠를 단다. |
| **3단계** | **Order**로 User와 Product를 이어 “누가 무엇을 샀는지”를 기록한다. |

지금 할 일만 다시 고정하면:

> **1단계만 본다. 등록 → 삭제 → 수정 UI 순으로, API는 먼저 검증하고 화면은 한 기능씩.**  
> 1단계 체크리스트가 전부 체크되기 전에는 2단계 코드를 작성하지 않는다.

이 문서가 전체 지도이고, 세부 CRUD 복습은 `CRUD_LEARNING_GUIDE.md` 를 함께 보면 된다.
