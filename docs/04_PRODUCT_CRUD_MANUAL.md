# 1단계 작업 매뉴얼  
## 상품 등록 · 수정 · 삭제 UI 완성 (따라 하기)

| 항목 | 내용 |
|------|------|
| 대상 | 로드맵 **1단계**만 |
| 전제 | 백엔드 상품 CRUD API는 **이미 있음**. 목록 화면(Read)도 **이미 있음** |
| 목표 | 브라우저만으로 **등록 / 수정 / 삭제**까지 끝내기 |
| 관련 | 설계서 `docs/PHASE1_DESIGN.md` · 로드맵 `ROADMAP_3PHASE.md` |

---

## 이 매뉴얼 쓰는 법

1. **위에서 아래 순서 그대로** 진행한다. 건너뛰지 않는다.  
2. 각 **작업(Work)** 끝에 있는 **확인** 을 통과한 뒤에만 다음으로 간다.  
3. 코드는 **예시 그대로 붙여 넣어도 되고**, 이해한 뒤 손수 쳐도 된다.  
4. **2단계(로그인), 3단계(주문) 코드는 절대 넣지 않는다.**  
5. 막히면 맨 아래 **부록: 문제 해결** 을 본다.

### 1단계가 끝났다고 말하는 기준

브라우저 `http://localhost:5173` 에서:

- [ ] 상품 목록이 보인다  
- [ ] **상품 등록** → 목록에 새 행이 생긴다  
- [ ] **수정** → 값이 바뀐다  
- [ ] **삭제** → 행이 사라진다  
- [ ] 실패 시 빨간 에러(또는 안내)가 보인다  

Postman 없이도 위가 되면 **1단계 완료**.

---

# 시작 전: 환경 준비

## Work 0. 서버 두 개 켜기

### 0-1. MySQL

- MySQL이 실행 중인지 확인한다.  
- DB 이름: `restapi_crud`  
- 계정/비번이 `src/main/resources/application.properties` 와 같은지 확인한다.  
  (예: `username=root`, `password=...`)

DB가 없으면 (MySQL 클라이언트에서):

```sql
CREATE DATABASE restapi_crud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 0-2. 백엔드 실행

프로젝트 **루트** (`restapi_crud/`) 에서:

```bash
./gradlew bootRun
```

**확인**

- 터미널에 기동 완료 로그가 보인다.  
- **Postman** 으로 확인:

  1. 새 Request 생성  
  2. Method: **GET**  
  3. URL: `http://localhost:8080/api/insurance-products`  
  4. **Send**

- Body 에 `[]` 또는 JSON 배열이 나오면 성공.  
- 연결 거부·에러면 백엔드가 안 뜬 것.

### 0-3. 프론트 실행

**다른 터미널**에서:

```bash
cd frontend
npm install
npm run dev
```

**확인**

- 터미널에 `http://localhost:5173` 안내  
- 브라우저로 열면 **보험 상품 목록** 화면이 보인다 (이미 구현된 목록).

### 0-4. 체크

| 확인 | 결과 |
|------|------|
| MySQL 동작 | ☐ |
| `http://localhost:8080/api/insurance-products` 응답 | ☐ |
| `http://localhost:5173` 목록 화면 | ☐ |

→ 세 개 다 되면 **Work 1** 로.

---

# Work 1. 등록 API 경로 버그 수정 (5분)

## 왜 하나?

등록 함수 path에 `/` 가 빠져 있으면 등록만 실패할 수 있다.  
다른 함수는 `/api/...` 인데 등록만 `api/...` 이다.

## 할 일

1. 파일을 연다:

   `frontend/src/api/insuranceProductApi.ts`

2. `createInsuranceProduct` 함수 안을 찾는다.

3. **아래처럼 고친다.**

**수정 전**

```ts
const response = await api.post<InsuranceProductResponse>('api/insurance-products', data);
```

**수정 후**

```ts
const response = await api.post<InsuranceProductResponse>('/api/insurance-products', data);
```

(`'api/...` → `'/api/...` 앞에 슬래시 하나)

4. 파일을 저장한다.

## 확인

- [ ] 해당 줄이 `'/api/insurance-products'` 이다  
- [ ] `get` / `put` / `delete` 도 모두 `/api/` 로 시작한다  

---

# Work 2. 백엔드 API를 손으로 확인 (15분)

화면 만들기 **전에**, API가 살아 있는지 확인한다.  
문제 생기면 프론트 탓이 아니라 백엔드/DB 탓으로 좁힌다.

**Postman** 에서 순서대로 보낸다.  
(공통: Base URL 은 `http://localhost:8080`)

### 2-0. Postman 준비

1. Postman 을 연다.  
2. 새 Request 를 만들거나, 컬렉션 `insurance-products` 를 만들어도 된다.  
3. Body 가 있는 요청(POST/PUT)은  
   - Body 탭 → **raw** → 오른쪽 타입 **JSON** 선택  
   - (이렇게 하면 `Content-Type: application/json` 이 자동으로 붙는다)

### 2-1. 목록 조회

| 항목 | 값 |
|------|-----|
| Method | **GET** |
| URL | `http://localhost:8080/api/insurance-products` |
| Body | 없음 |

**Send** → 기대: Status **200**, Body `[]` 또는 `[{...}]`

### 2-2. 등록

| 항목 | 값 |
|------|-----|
| Method | **POST** |
| URL | `http://localhost:8080/api/insurance-products` |
| Body (raw / JSON) | 아래 JSON |

```json
{
  "name": "매뉴얼테스트상품",
  "company": "테스트생명",
  "type": "종신",
  "monthlyPremium": 50000,
  "description": "1단계 연습"
}
```

**Send** → 기대:

- Status **201** (또는 구현에 따라 **200**)  
- Body JSON 한 건, 안에 `"id": 숫자`, `"name": "매뉴얼테스트상품"`  
- **응답 Body 의 `id` 값을 메모**한다 (아래 단건·수정·삭제에 사용)

### 2-3. 방금 만든 id로 단건 조회

응답에 나온 `id` 를 URL 에 넣는다 (예: `1`).

| 항목 | 값 |
|------|-----|
| Method | **GET** |
| URL | `http://localhost:8080/api/insurance-products/1` |
| Body | 없음 |

**Send** → 기대: Status **200**, 해당 상품 1건 JSON

### 2-4. 수정

| 항목 | 값 |
|------|-----|
| Method | **PUT** |
| URL | `http://localhost:8080/api/insurance-products/1` |
| Body (raw / JSON) | 아래 JSON |

```json
{
  "name": "매뉴얼수정상품",
  "company": "테스트생명",
  "type": "종신",
  "monthlyPremium": 55000,
  "status": "판매중"
}
```

**Send** → 기대: Status **200**, Body 에 `"name": "매뉴얼수정상품"`, `"monthlyPremium": 55000`

### 2-5. 삭제

| 항목 | 값 |
|------|-----|
| Method | **DELETE** |
| URL | `http://localhost:8080/api/insurance-products/1` |
| Body | 없음 |

**Send** → 기대: Status **204** (Body 는 비어 있어도 정상)

### 2-6. 체크

| API | 확인 |
|-----|------|
| GET 목록 | ☐ |
| POST 등록 | ☐ |
| GET 단건 | ☐ |
| PUT 수정 | ☐ |
| DELETE 삭제 | ☐ |

하나라도 실패하면 **프론트 작업 중단**. 백엔드 로그·MySQL·포트를 먼저 고친다.

---

# Work 3. 라우터 뼈대 만들기 (20분)

## 왜 하나?

목록 / 등록 / 수정을 **다른 URL** 로 나눈다.

| URL | 화면 |
|-----|------|
| `/` | 목록 |
| `/products/new` | 등록 |
| `/products/:id/edit` | 수정 (`:id` 는 숫자) |

`react-router-dom` 은 이미 `package.json` 에 있다. 추가 설치 불필요.

### 라라벨·장고 쓰던 사람을 위한 한 줄 비유

| 예전에 알던 것 | 지금 React 쪽 |
|----------------|---------------|
| 라라벨 `routes/web.php`, 장고 `urls.py` | `App.tsx` 의 `<Route>` 들 |
| 컨트롤러가 뷰 이름 반환 | URL에 맞는 **페이지 컴포넌트**를 화면에 그림 |
| Blade / Django 템플릿 | `return (...)` 안의 JSX (HTML 비슷한 문법) |
| 서버가 페이지를 통째로 내려줌 | 브라우저는 한 번 앱을 받고, **주소만 바꿔** 화면을 갈아끼움 |

지금은 “빈 방”만 만들고, 진짜 폼은 Work 4·6 에서 채운다.

## 3-1. 빈 등록 페이지 파일 생성

경로: `frontend/src/pages/InsuranceProductCreate.tsx`

**새 파일**을 만들고 아래 내용을 넣는다.

```tsx
// ============================================================
// 이 파일 = "상품 등록" 전용 화면 (지금은 빈 껍데기)
// 라라벨로 치면 create.blade.php 를 먼저 만들고,
// 나중에 폼 필드를 채우는 것과 비슷하다.
// ============================================================

// function 이름 = 화면 이름이라고 생각해도 된다.
// React 에서는 이런 함수를 "컴포넌트" 라고 부른다.
function InsuranceProductCreate() {
  // return 안의 내용이 브라우저에 실제로 그려진다.
  // HTML 처럼 보이지만, 사실은 JavaScript 안의 "JSX" 문법이다.
  return (
    // div = 박스. style={{ ... }} 는 인라인 CSS (쌍중괄호가 정상)
    // 바깥 {} = "여기는 JS 식이야", 안쪽 {} = CSS 객체 { padding: '20px' }
    <div style={{ padding: '20px' }}>
      <h1>상품 등록 (준비 중)</h1>
      <p>Work 4에서 폼을 만듭니다.</p>
      {/* a 태그 = 일반 링크. 지금은 단순하게 목록(/) 으로 보낸다 */}
      <a href="/">목록으로</a>
    </div>
  );
}

// 다른 파일(App.tsx)에서 이 화면을 import 해서 쓸 수 있게 "내보내기"
// 라라벨의 return view('...') 에 대응하는 "이 화면 쓸 수 있게 공개" 단계
export default InsuranceProductCreate;
```

## 3-2. 빈 수정 페이지 파일 생성

경로: `frontend/src/pages/InsuranceProductEdit.tsx`

```tsx
// ============================================================
// 이 파일 = "상품 수정" 전용 화면 (지금은 빈 껍데기)
// URL 예: /products/3/edit  →  여기서 3 이 id
// ============================================================

// useParams = 주소창에 적힌 값을 읽어 오는 React 훅(도구 함수)
// 라라벨의 $id = request()->route('id') / 장고 path converter 와 같은 역할
import { useParams } from 'react-router-dom';

function InsuranceProductEdit() {
  // URL 의 :id 자리를 꺼내온다.
  // 예: /products/5/edit 이면 id 는 문자열 "5"
  // const { id } = ...  는 객체에서 id 만 뽑는 문법 (구조 분해)
  const { id } = useParams();

  return (
    <div style={{ padding: '20px' }}>
      <h1>상품 수정 (준비 중)</h1>
      {/*
        {id} 처럼 중괄호 안은 "변수 값을 화면에 찍어라" 라는 뜻.
        Blade 의 {{ $id }}, Django 의 {{ id }} 와 비슷한 느낌.
      */}
      <p>상품 ID: {id}</p>
      <p>Work 6에서 폼을 만듭니다.</p>
      <a href="/">목록으로</a>
    </div>
  );
}

export default InsuranceProductEdit;
```

## 3-3. `App.tsx` 를 라우터로 교체

파일: `frontend/src/App.tsx`

**파일 전체를** 아래처럼 바꿔도 된다. (기존 Vite 주석 템플릿은 지워도 됨)

```tsx
// ============================================================
// App.tsx = 앱 전체의 "교통 정리 센터" (라우터)
// 라라벨 routes/web.php, 장고 urls.py 에 가장 가까운 파일
// ============================================================

// BrowserRouter, Routes, Route = URL ↔ 화면 연결 도구
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 각 페이지 컴포넌트 (방 3개) 를 불러온다
import InsuranceProductList from './pages/InsuranceProductList.tsx';
import InsuranceProductCreate from './pages/InsuranceProductCreate.tsx';
import InsuranceProductEdit from './pages/InsuranceProductEdit.tsx';

function App() {
  return (
    // BrowserRouter: 브라우저 주소창을 보고 화면을 바꿀 수 있게 감싸 주는 통
    // 이 통 안에 있는 Route 들만 "주소 따라 화면 바꾸기" 가 동작한다
    <BrowserRouter>
      {/* Routes: "아래 규칙 중 하나에 맞춰라" 라고 묶는 상자 */}
      <Routes>
        {/* path = 주소, element = 그 주소일 때 보여줄 화면 */}
        {/* "/" 이면 목록 페이지 */}
        <Route path="/" element={<InsuranceProductList />} />

        {/* "/products/new" 이면 등록 페이지 */}
        <Route path="/products/new" element={<InsuranceProductCreate />} />

        {/*
          ":id" 는 자리 표시자(변수).
          /products/1/edit, /products/99/edit 모두 이 규칙에 걸린다.
          실제 숫자는 수정 페이지 안에서 useParams() 로 읽는다.
          라라벨: Route::get('/products/{id}/edit', ...)
          장고: path('products/<int:id>/edit/', ...)
        */}
        <Route path="/products/:id/edit" element={<InsuranceProductEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

// main.tsx 등이 이 App 을 최상단으로 그린다
export default App;
```

저장 후 브라우저를 새로고침한다.

## 3-4. 확인

| URL | 기대 화면 |
|-----|-----------|
| `http://localhost:5173/` | 기존 상품 목록 |
| `http://localhost:5173/products/new` | “상품 등록 (준비 중)” |
| `http://localhost:5173/products/1/edit` | “상품 수정 (준비 중)”, ID: 1 |

- [ ] 세 URL 모두 열림  
- [ ] 콘솔에 Router 관련 빨간 에러 없음  

→ 통과 시 **Work 4**.

---

# Work 4. 상품 등록 화면 만들기 (핵심, 40~60분)

## 목표

`/products/new` 에서 입력 → 서버에 POST → 성공하면 목록(`/`)으로 이동 → 목록에 새 상품이 보인다.

## 4-1. `InsuranceProductCreate.tsx` 전체 교체

파일: `frontend/src/pages/InsuranceProductCreate.tsx`

아래 내용으로 **통째로 교체**한다.

**한 줄 흐름 (먼저 머릿속에 넣고 코드를 보면 쉽다)**

1. 입력칸마다 “기억 상자(state)” 를 만든다  
2. 글자를 치면 상자를 갱신한다  
3. 등록 버튼을 누르면 검사 → 서버에 POST → 성공 시 목록으로 이동  

```tsx
// ============================================================
// 상품 등록 화면 (진짜 폼)
// 흐름: 입력 → 검사 → POST API → 성공하면 목록(/) 으로 이동
//
// 라라벨 비유:
//   - 이 파일 ≈ create 뷰 + 폼 submit 처리의 "앞단"
//   - createInsuranceProduct() ≈ axios 로 POST /api/... 호출
//   - 진짜 DB 저장은 자바(Spring) 백엔드가 한다
// ============================================================

// useState = "화면이 기억해야 하는 값" 을 만드는 도구
// 값이 바뀌면 React 가 화면을 다시 그려 준다
import { useState } from 'react';

// useNavigate = 코드로 페이지 이동 (리다이렉트)
// Link = 클릭해서 이동하는 링크 (<a> 대신, 풀 새로고침 없이 이동)
import { useNavigate, Link } from 'react-router-dom';

// API 호출 함수 (이미 프로젝트에 있음). 서버에 POST 한다
import { createInsuranceProduct } from '../api/insuranceProductApi.ts';

// 서버에 보낼 JSON 모양을 정해 둔 타입 (TypeScript)
// "이 객체에는 name, company 같은 필드가 있어야 해" 라고 컴파일러가 검사
import type { InsuranceProductRequest } from '../types/insuranceProduct.ts';

function InsuranceProductCreate() {
  // navigate('/') 를 호출하면 목록 주소로 이동한다
  // 라라벨 redirect()->route('...') 와 비슷한 역할
  const navigate = useNavigate();

  // ---------- 입력 값 state (기억 상자) ----------
  // 규칙: const [현재값, 바꾸는함수] = useState(처음값);
  // setName('홍길동') 을 하면 name 이 '홍길동' 으로 바뀌고 화면이 갱신된다
  const [name, setName] = useState('');                 // 상품명, 처음은 빈 칸
  const [company, setCompany] = useState('');           // 보험사
  const [type, setType] = useState('종신');             // 유형, 기본값 종신
  // 보험료는 입력 중엔 문자열로 두는 편이 편하다 (빈 칸 "" 허용)
  // 서버로 보낼 때만 Number(...) 로 숫자로 바꾼다
  const [monthlyPremium, setMonthlyPremium] = useState<string>('');
  const [description, setDescription] = useState(''); // 설명 (선택)
  const [status, setStatus] = useState('판매중');       // 상태 기본값

  // ---------- 화면 상태 ----------
  const [loading, setLoading] = useState(false); // true 면 "등록 중..." (버튼 잠금)
  // error 가 null 이면 에러 없음. 문자열이면 빨간 글씨로 보여 줌
  const [error, setError] = useState<string | null>(null);

  // ---------- 폼 제출 함수 ----------
  // async = 안에서 await(서버 응답 기다리기) 를 쓰겠다는 표시
  // e = 폼 이벤트 객체 (브라우저가 넘겨 줌)
  const handleSubmit = async (e: React.FormEvent) => {
    // HTML 폼의 기본 동작 = 페이지 전체를 새로고침하며 제출
    // SPA 에서는 그걸 막고, 우리가 fetch/axios 로 보낸다
    e.preventDefault();
    setError(null); // 이전 에러 문구 지우기

    // --- 프론트 필수값 검사 (서버 가기 전 1차 필터) ---
    // trim() = 앞뒤 공백 제거. 공백만 입력한 것도 빈 값으로 본다
    if (!name.trim()) {
      setError('상품명을 입력하세요.');
      return; // 여기서 끊고 서버로 안 보냄
    }
    if (!company.trim()) {
      setError('보험사를 입력하세요.');
      return;
    }
    if (!type.trim()) {
      setError('유형을 입력하세요.');
      return;
    }
    // 빈 칸이거나, 숫자로 바꿨을 때 NaN(Not a Number) 이면 실패
    if (monthlyPremium === '' || Number.isNaN(Number(monthlyPremium))) {
      setError('월 보험료를 숫자로 입력하세요.');
      return;
    }

    // 서버에 보낼 몸통(body). Postman 에서 넣던 JSON 과 같은 내용
    const body: InsuranceProductRequest = {
      name: name.trim(),
      company: company.trim(),
      type: type.trim(),
      monthlyPremium: Number(monthlyPremium), // 문자열 → 숫자
      // 설명이 비어 있으면 필드 자체를 안 보냄 (undefined)
      description: description.trim() || undefined,
      status: status || undefined,
    };

    try {
      setLoading(true); // 버튼 "등록 중..." + 중복 클릭 방지
      // 서버에 POST. 실패하면 아래 catch 로 점프
      await createInsuranceProduct(body);
      // 여기까지 왔으면 성공 → 목록으로 이동
      navigate('/');
    } catch (err) {
      // 네트워크 오류, 500 등. 개발자 도구 Console 에도 찍어둠
      console.error(err);
      setError('상품 등록에 실패했습니다. 서버 로그와 Network 탭을 확인하세요.');
    } finally {
      // 성공이든 실패든 항상 실행 → 로딩 상태 해제
      setLoading(false);
    }
  };

  // ---------- 화면(JSX) ----------
  return (
    <div style={{ padding: '20px', maxWidth: 560 }}>
      <h1>상품 등록</h1>
      <p>
        {/* Link = React Router 링크. <a href> 보다 SPA 이동에 맞음 */}
        <Link to="/">← 목록으로</Link>
      </p>

      {/*
        {error && (...)} 의미:
        error 가 있으면(truthy) 뒤쪽 JSX 를 그리고,
        null/빈 값이면 아무 것도 안 그린다.
        "에러 있을 때만 빨간 박스"
      */}
      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      {/* onSubmit = 사용자가 등록 버튼을 누르거나 Enter 로 제출할 때 */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            상품명 *{' '}
            {/*
              제어 컴포넌트(controlled input) 패턴:
              - value={name}           → 화면에 보이는 글자 = state
              - onChange 에서 setName  → 사용자가 칠 때마다 state 갱신
              Blade 의 value="{{ old('name') }}" + JS 연동과 비슷한 느낌
            */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            보험사 *{' '}
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            유형 *{' '}
            {/* select 도 같은 패턴: value + onChange 로 state 와 연결 */}
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="종신">종신</option>
              <option value="실손">실손</option>
              <option value="자동차">자동차</option>
              <option value="연금">연금</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            월 보험료 (원) *{' '}
            <input
              type="number" // 숫자 키패드/화살표 (브라우저는 그래도 문자열로 줌)
              min={0}       // 0 미만 입력 방지(브라우저 힌트)
              value={monthlyPremium}
              onChange={(e) => setMonthlyPremium(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            설명{' '}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            상태{' '}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="판매중">판매중</option>
              <option value="판매중지">판매중지</option>
              <option value="준비중">준비중</option>
            </select>
          </label>
        </div>

        {/*
          type="submit" → 이 버튼을 누르면 form 의 onSubmit 발동
          disabled={loading} → 등록 중이면 버튼 클릭 불가 (두 번 전송 방지)
          {loading ? A : B} → 삼항 연산자. 로딩이면 A, 아니면 B 글자
        */}
        <button type="submit" disabled={loading}>
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}

export default InsuranceProductCreate;
```

## 4-2. 목록에 “상품 등록” 버튼 넣기

파일: `frontend/src/pages/InsuranceProductList.tsx`

### (1) import 추가

파일 상단 import 근처에 추가:

```tsx
// Link = 페이지 이동용 링크 컴포넌트 (React Router)
// 일반 <a href="..."> 와 비슷하지만, 브라우저 전체 새로고침 없이 화면만 바꿈
import { Link } from 'react-router-dom';
```

### (2) 제목 아래 버튼 추가

`return` 안의 `<h1>보험 상품 목록</h1>` 바로 아래(또는 옆에) 추가:

```tsx
{/* to="/products/new" = App.tsx 에 등록한 등록 페이지 주소로 이동 */}
<p>
  <Link to="/products/new">+ 상품 등록</Link>
</p>
```

예시 위치:

```tsx
return (
  <div style={{ padding: '20px' }}>
    <h1>보험 상품 목록</h1>
    {/* 제목 바로 아래: 등록 화면으로 가는 입구 */}
    <p>
      <Link to="/products/new">+ 상품 등록</Link>
    </p>
    {products.length === 0 ? (
      // ... 이하 기존 그대로
```

## 4-3. 직접 확인 (등록 E2E)

1. `http://localhost:5173/` 접속  
2. **+ 상품 등록** 클릭 → `/products/new`  
3. 예시 입력:

   | 필드 | 값 |
   |------|-----|
   | 상품명 | 화면등록테스트 |
   | 보험사 | 국민보험 |
   | 유형 | 실손 |
   | 월 보험료 | 30000 |
   | 설명 | 매뉴얼 Work4 |
   | 상태 | 판매중 |

4. **등록하기** 클릭  
5. 목록(`/`)으로 이동하는지 확인  
6. 표에 **화면등록테스트** 행이 있는지 확인  

### 개발자 도구로 꼭 보기

1. F12 → **Network**  
2. 등록 한 번 더 (또는 위 과정 재실행)  
3. `insurance-products` **POST** 요청 찾기  

| 확인 | 기대 |
|------|------|
| Request URL | `http://localhost:8080/api/insurance-products` |
| Status | **201** |
| Request Payload | name, company, type, monthlyPremium 등 |

## 4-4. 체크

- [ ] 등록 페이지 폼이 보인다  
- [ ] 필수값 비우면 에러 문구  
- [ ] 등록 성공 후 목록 이동  
- [ ] 목록에 새 상품 표시  
- [ ] Network POST 201  

실패 시:

- POST URL이 이상하면 → Work 1 path 재확인  
- CORS 에러 → 백엔드 기동·`WebConfig` origin  
- 500 → 백엔드 터미널 로그  

→ 통과 시 **Work 5**.

---

# Work 5. 삭제 기능 (목록에 붙이기) (20~30분)

## 목표

목록 각 행의 **삭제** 버튼 → 확인창 → DELETE API → 목록에서 사라짐.

## 5-1. import 수정

`InsuranceProductList.tsx` 상단:

**기존**

```tsx
// 목록 조회 함수만 쓰고 있었음
import { getInsuranceProducts } from '../api/insuranceProductApi.ts';
```

**변경**

```tsx
// 같은 파일에서 "목록 가져오기" + "하나 지우기" 두 함수를 불러온다
// 중괄호 { A, B } = named export 여러 개 한 번에 가져오기
import {
  getInsuranceProducts,    // GET 목록
  deleteInsuranceProduct,  // DELETE 한 건 (이번에 추가)
} from '../api/insuranceProductApi.ts';
```

(`Link` import 는 Work 4에서 이미 넣었으면 유지)

## 5-2. 목록을 다시 불러오는 함수 만들기

지금 `useEffect` 안에만 fetch 로직이 있으면, 삭제 후 재사용이 어렵다.  
**같은 파일 안**에서 다음처럼 정리하는 것을 권장한다.

`InsuranceProductList` 함수 컴포넌트 **안**, `useEffect` **위**에 함수를 두고, `useEffect` 에서는 그걸 호출한다.

**왜 함수로 빼나?**  
- 처음 화면 들어올 때 한 번 목록 로드  
- 삭제 성공 후에도 **같은 함수**로 목록 다시 로드  
→ “한 군데만 고치면 두 군데가 같이 좋아짐”

예시 구조 (기존 state 선언 아래에 맞춤):

```tsx
// ------------------------------------------------------------
// 서버에서 상품 목록을 가져와 products state 에 넣는다
// 라라벨 컨트롤러의 index() 가 view 에 $products 넘기는 것과 비슷한 역할
// (다만 여기는 브라우저가 API 를 호출하는 쪽)
// ------------------------------------------------------------
const fetchProducts = async () => {
  try {
    setLoading(true);   // "로딩 중..." 표시용
    setError(null);     // 이전 에러 지우기
    // await = 서버 응답이 올 때까지 잠깐 기다림
    const data = await getInsuranceProducts();
    setProducts(data);  // 받은 배열을 화면에 쓸 state 에 저장
  } catch (err) {
    console.error(err); // 개발자 도구에 자세한 원인
    setError('보험 상품 목록을 가져오는 중 오류가 발생했습니다.');
  } finally {
    // 성공/실패와 관계없이 로딩 표시는 끈다
    setLoading(false);
  }
};

// useEffect = "이 화면이 처음 나타날 때 할 일"
// 두 번째 인자 [] = "맨 처음 한 번만" (의존 배열이 비어 있음)
// 라라벨로 치면 페이지 진입 시 index 가 자동 실행되는 느낌
useEffect(() => {
  fetchProducts();
}, []);

// ------------------------------------------------------------
// 삭제 버튼 클릭 시 실행
// id = 지울 상품 번호, productName = 확인창에 보여 줄 이름
// ------------------------------------------------------------
const handleDelete = async (id: number, productName: string) => {
  // window.confirm = 브라우저 기본 "확인/취소" 창
  // 확인 → true, 취소 → false
  // 백틱 `...${변수}...` = 문자열 안에 변수 끼워 넣기 (템플릿 리터럴)
  const ok = window.confirm(`"${productName}" 상품을 삭제할까요?`);
  if (!ok) return; // 취소 눌렀으면 여기서 끝. 서버 호출 안 함

  try {
    // DELETE /api/insurance-products/{id}
    await deleteInsuranceProduct(id);
    // DB 에서 지워졌으니, 화면 목록도 다시 맞춰 준다
    // (안 다시 불러오면, 서버엔 없는데 표에는 남아 보일 수 있음)
    await fetchProducts();
  } catch (err) {
    console.error(err);
    setError('삭제에 실패했습니다.');
  }
};
```

> 참고: `useEffect` 의존성 경고가 나오면, 학습 단계에서는 일단 `[]` 유지해도 된다.  
> (나중에 `useCallback` 으로 다듬을 수 있음)

## 5-3. 테이블에 “관리” 열 추가

`<thead>` 의 `<tr>` 안에 열 추가:

```tsx
{/* 표 맨 오른쪽 "수정 / 삭제" 칸의 제목 */}
<th>관리</th>
```

`<tbody>` 의 각 `<tr>` 안, 마지막에:

```tsx
{/*
  product 는 보통 products.map((product) => ...) 안에서 한 행씩 도는 중
  각 상품마다 수정 링크 + 삭제 버튼을 붙인다
*/}
<td>
  {/*
    백틱 문자열로 URL 을 만든다.
    예: product.id 가 3 이면 → /products/3/edit
    App.tsx 의 path="/products/:id/edit" 와 짝이 맞아야 한다
  */}
  <Link to={`/products/${product.id}/edit`} style={{ marginRight: 8 }}>
    수정
  </Link>
  {/*
    type="button" 을 꼭 쓴다.
    안 쓰면 form 안에 있을 때 submit 으로 오해될 수 있다.
    onClick 에서 handleDelete 에 id 와 이름을 넘겨 준다.
    () => ... 를 쓰는 이유: "지금 당장 실행" 이 아니라 "클릭할 때 실행"
  */}
  <button
    type="button"
    onClick={() => handleDelete(product.id, product.name)}
  >
    삭제
  </button>
</td>
```

> **수정 링크**는 Work 6 전에 눌러도 “준비 중” 페이지만 보인다.  
> Work 6 에서 진짜 수정 폼을 채운다. 삭제만 먼저 검증해도 된다.

## 5-4. 직접 확인 (삭제 E2E)

1. 목록에 상품이 최소 1개 있게 등록해 둔다.  
2. 해당 행 **삭제** 클릭  
3. confirm 에서 **취소** → 행이 그대로  
4. 다시 **삭제** → **확인**  
5. 행이 목록에서 사라짐  

Network:

| 확인 | 기대 |
|------|------|
| DELETE | `/api/insurance-products/{id}` |
| Status | **204** |
| 이후 GET 목록 | 200, 삭제된 id 없음 |

## 5-5. 체크

- [ ] 삭제 확인창 뜸  
- [ ] 취소 시 유지  
- [ ] 확인 시 삭제 + 목록 갱신  
- [ ] Network 204  

→ 통과 시 **Work 6**.

---

# Work 6. 상품 수정 화면 만들기 (40~60분)

## 목표

목록 **수정** → `/products/3/edit` 처럼 이동 → 기존 값이 폼에 채워짐 → 고쳐서 저장 → 목록에 반영.

## 6-1. `InsuranceProductEdit.tsx` 전체 교체

파일: `frontend/src/pages/InsuranceProductEdit.tsx`

**등록(Work 4)과의 차이만 먼저 기억하자**

| | 등록 Create | 수정 Edit |
|--|-------------|-----------|
| 들어올 때 | 빈 폼 | **GET** 으로 기존 값 채움 |
| 저장할 때 | **POST** (새로 만들기) | **PUT** (그 id 덮어쓰기) |
| URL | `/products/new` | `/products/:id/edit` |

라라벨로 치면 `edit` 뷰 + `update` 요청을 한 파일에서 처리하는 느낌이다.

```tsx
// ============================================================
// 상품 수정 화면
// 흐름:
//   1) URL 에서 id 읽기
//   2) GET 으로 기존 상품 받아 폼에 채우기
//   3) 사용자가 고친 뒤 저장 → PUT → 목록으로 이동
// ============================================================

// useEffect = 화면이 뜬 뒤(또는 값이 바뀐 뒤) 부수 작업을 할 때
// useState  = 입력값·로딩·에러 같은 "기억"
import { useEffect, useState } from 'react';

// useParams  = URL 의 :id 꺼내기
// useNavigate = 저장 후 목록으로 보내기
// Link       = 목록 링크
import { useNavigate, useParams, Link } from 'react-router-dom';

// 단건 조회(GET) + 수정(PUT)
import {
  getInsuranceProduct,
  updateInsuranceProduct,
} from '../api/insuranceProductApi.ts';

// 서버에 보낼 요청 몸통 타입 (등록과 같은 모양)
import type { InsuranceProductRequest } from '../types/insuranceProduct.ts';

function InsuranceProductEdit() {
  // URL 예: /products/3/edit → id 는 문자열 "3"
  const { id } = useParams();
  const navigate = useNavigate();

  // API 와 숫자 비교를 위해 문자열 id → 숫자로 변환
  // "abc" 처럼 이상하면 Number.isNaN(productId) 가 true 가 된다
  const productId = Number(id);

  // ---------- 폼 필드 state (등록 화면과 같은 패턴) ----------
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState('종신');
  const [monthlyPremium, setMonthlyPremium] = useState<string>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('판매중');

  // 처음 데이터 불러오는 중인가? (true 면 "불러오는 중..." 화면)
  const [initialLoading, setInitialLoading] = useState(true);
  // 저장 버튼 누른 뒤 서버 기다리는 중인가?
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 페이지 들어오면(또는 id 가 바뀌면) 기존 상품 1건 불러오기
  // 라라벨 edit($id) 에서 Product::find($id) 한 뒤 form 에 넣는 것과 같음
  // ============================================================
  useEffect(() => {
    // id 가 없거나 숫자가 아니면 폼을 채울 수 없음
    if (!id || Number.isNaN(productId)) {
      setError('잘못된 상품 ID 입니다.');
      setInitialLoading(false);
      return; // load() 를 호출하지 않음
    }

    // useEffect 안에서 async 를 직접 못 쓰므로, 안쪽에 함수를 만들고 바로 호출
    const load = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        // GET /api/insurance-products/{id}
        const data = await getInsuranceProduct(productId);

        // 서버가 준 값을 각 입력 state 에 넣으면 → 폼에 글자가 채워진다
        setName(data.name);
        setCompany(data.company);
        setType(data.type);
        // input value 는 보통 문자열과 잘 맞으므로 숫자를 문자열로
        setMonthlyPremium(String(data.monthlyPremium));
        // description 이 null 일 수 있음 → ?? '' 로 빈 문자열 대체
        // (A ?? B) = A 가 null 또는 undefined 이면 B, 아니면 A
        setDescription(data.description ?? '');
        setStatus(data.status);
      } catch (err) {
        console.error(err);
        setError('상품을 불러오지 못했습니다. ID를 확인하세요.');
      } finally {
        setInitialLoading(false); // 로딩 끝 (성공이든 실패든)
      }
    };

    load(); // 정의하자마자 실행

    // 의존 배열 [id, productId]:
    // 이 값들이 바뀔 때만 다시 불러온다.
    // 예: /products/1/edit → /products/2/edit 로 바뀌면 다시 load
  }, [id, productId]);

  // ============================================================
  // 수정 저장 (폼 submit)
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 제출 막기
    setError(null);

    // 필수값 간단 검사 (등록과 동일 취지)
    if (!name.trim() || !company.trim() || !type.trim()) {
      setError('상품명, 보험사, 유형은 필수입니다.');
      return;
    }
    if (monthlyPremium === '' || Number.isNaN(Number(monthlyPremium))) {
      setError('월 보험료를 숫자로 입력하세요.');
      return;
    }

    // 서버에 보낼 JSON 몸통
    const body: InsuranceProductRequest = {
      name: name.trim(),
      company: company.trim(),
      type: type.trim(),
      monthlyPremium: Number(monthlyPremium),
      description: description.trim() || undefined,
      status: status || undefined,
    };

    try {
      setSaving(true);
      // PUT /api/insurance-products/{id}  + body
      // 등록의 create(POST) 와 달리, "어느 상품인지" id 가 꼭 필요
      await updateInsuranceProduct(productId, body);
      navigate('/'); // 성공 → 목록
    } catch (err) {
      console.error(err);
      setError('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- 아직 서버 응답 전 ----------
  // early return: 여기서 화면을 끝낸다 (아래 폼 JSX 는 실행 안 됨)
  if (initialLoading) {
    return <div style={{ padding: 20 }}>불러오는 중...</div>;
  }

  // ---------- 불러오기 자체가 실패한 경우 ----------
  // 이름·보험사가 비어 있고 error 가 있으면 → 폼을 보여 줘도 의미 없음
  if (error && !name && !company) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/">목록으로</Link>
      </div>
    );
  }

  // ---------- 정상: 수정 폼 ----------
  return (
    <div style={{ padding: '20px', maxWidth: 560 }}>
      {/* 지금 몇 번 상품을 고치는지 제목에 표시 */}
      <h1>상품 수정 (ID: {productId})</h1>
      <p>
        <Link to="/">← 목록으로</Link>
      </p>

      {/* 저장 검증 실패 등, 폼은 보이되 에러만 위에 표시 */}
      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      {/* 입력 칸 패턴은 등록(Work 4) 과 거의 같다: value + onChange */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            상품명 *{' '}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            보험사 *{' '}
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            유형 *{' '}
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="종신">종신</option>
              <option value="실손">실손</option>
              <option value="자동차">자동차</option>
              <option value="연금">연금</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            월 보험료 (원) *{' '}
            <input
              type="number"
              min={0}
              value={monthlyPremium}
              onChange={(e) => setMonthlyPremium(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            설명{' '}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            상태{' '}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="판매중">판매중</option>
              <option value="판매중지">판매중지</option>
              <option value="준비중">준비중</option>
            </select>
          </label>
        </div>

        {/* saving 중이면 버튼 잠금 + 글자 변경 (중복 저장 방지) */}
        <button type="submit" disabled={saving}>
          {saving ? '저장 중...' : '수정 저장'}
        </button>
      </form>
    </div>
  );
}

export default InsuranceProductEdit;
```

## 6-2. 직접 확인 (수정 E2E)

1. 목록에서 한 상품의 **수정** 클릭  
2. 폼에 **기존 값**이 채워져 있는지 확인  
3. 상품명 끝에 `수정됨` 을 붙인다  
4. 월 보험료를 바꾼다  
5. **수정 저장**  
6. 목록으로 돌아와 값이 바뀌었는지 확인  

Network:

| 단계 | 기대 |
|------|------|
| 페이지 진입 | GET `/api/insurance-products/{id}` → **200** |
| 저장 | PUT 동일 path → **200** |
| 목록 | GET 목록 → 변경 반영 |

## 6-3. 체크

- [ ] 수정 URL에 id가 들어간다  
- [ ] 기존 값이 폼에 로드된다  
- [ ] 저장 후 목록 반영  
- [ ] GET 200, PUT 200  

→ 통과 시 **Work 7**.

---

# Work 7. 마무리 점검 (15분)

## 7-1. 전체 시나리오 한 번에

순서대로 직접 클릭한다.

| # | 행동 | 기대 |
|---|------|------|
| 1 | 목록 접속 | 표 또는 빈 목록 문구 |
| 2 | 상품 등록 | 새 행 생김 |
| 3 | 그 행 수정 | 값 변경됨 |
| 4 | 그 행 삭제 | 행 사라짐 |
| 5 | 이름 비우고 등록 시도 | 에러 문구, 서버 미호출 또는 실패 안내 |
| 6 | 백엔드 끈 뒤 목록 새로고침 | 에러 문구 (흰 화면 크래시 아님) |

## 7-2. 파일 체크리스트

| 파일 | 상태 |
|------|------|
| `frontend/src/api/insuranceProductApi.ts` | create path에 `/` 있음 |
| `frontend/src/App.tsx` | BrowserRouter + 3 Route |
| `frontend/src/pages/InsuranceProductList.tsx` | 목록 + 등록링크 + 수정링크 + 삭제 |
| `frontend/src/pages/InsuranceProductCreate.tsx` | 등록 폼 동작 |
| `frontend/src/pages/InsuranceProductEdit.tsx` | 로드 + 수정 폼 동작 |
| `frontend/src/types/insuranceProduct.ts` | 수정 불필요 (이미 있음) |
| 백엔드 Java | **1단계에서 필수 변경 없음** |

## 7-3. 하지 말 것 (다시 확인)

- [ ] User / 로그인 코드 안 넣음  
- [ ] Order / 구매 코드 안 넣음  
- [ ] 백엔드 대규모 리팩터 안 함  

## 7-4. 1단계 완료 선언

위 7-1, 7-2가 모두 되면:

> **1단계 완료. 다음은 `ROADMAP_3PHASE.md` 2단계(인증).**

설계서 기준 DoD 와 동일하면 `docs/PHASE1_DESIGN.md` 15장 체크에도 표시해 두면 좋다.

---

# (선택) Work 8. 조금만 더 다듬기

1단계 **필수는 아님**. 시간 있을 때만.

| 항목 | 내용 |
|------|------|
| 서버 검증 | Request DTO에 `@NotBlank` 등 |
| 404 | 없는 id 조회 시 예외 → 404 응답 |
| 폼 공통 컴포넌트 | Create/Edit 중복을 `InsuranceProductForm` 으로 합치기 |
| 삭제 중 버튼 비활성 | `deletingId` state |
| `useEffect` lint | `fetchProducts` 를 `useCallback` 으로 |

---

# 작업 순서 한눈에 보기

```
Work 0  환경 (MySQL + bootRun + npm run dev)
   ↓
Work 1  create path에 / 붙이기
   ↓
Work 2  Postman으로 API 5종 확인
   ↓
Work 3  라우터 + 빈 Create/Edit 페이지
   ↓
Work 4  등록 폼 완성 + 목록 링크     ← Create
   ↓
Work 5  목록 삭제 버튼               ← Delete
   ↓
Work 6  수정 폼 완성                 ← Update
   ↓
Work 7  전체 시나리오 점검           ← 1단계 끝
   ↓
Work 8  (선택) 다듬기
```

**절대 순서 바꾸지 말 것:**  
등록(Work4) 없이 수정(Work6)부터 하면, “폼·API·라우팅” 문제를 한꺼번에 겪는다.

---

# 각 Work에서 만지는 파일 요약

| Work | 수정·생성 파일 |
|------|----------------|
| 1 | `frontend/src/api/insuranceProductApi.ts` |
| 2 | (코드 없음, Postman만) |
| 3 | `App.tsx`, `pages/InsuranceProductCreate.tsx`(신규), `pages/InsuranceProductEdit.tsx`(신규) |
| 4 | `InsuranceProductCreate.tsx`, `InsuranceProductList.tsx` |
| 5 | `InsuranceProductList.tsx` |
| 6 | `InsuranceProductEdit.tsx` |
| 7 | 점검만 |

---

# 부록 A. 문제 해결

| 증상 | 원인 후보 | 할 일 |
|------|-----------|--------|
| 목록이 안 뜸 | BE 미기동, DB 오류, CORS | `bootRun` 로그, Postman GET 목록 |
| 등록 버튼 눌러도 변화 없음 | JS 에러, path 오타 | 브라우저 Console, Network |
| POST 404 | path에 `/` 없음, URL 오타 | Work 1 재확인 |
| POST CORS error | BE 꺼짐, origin 불일치 | BE 기동, `WebConfig` 5173 |
| POST 500 | DB, null 필수값 | BE 콘솔 스택트레이스 |
| 수정 시 폼이 비어 있음 | GET 실패, id NaN | Network GET, URL의 id |
| 삭제 후 그대로 | fetch 재호출 안 함 | `handleDelete` 후 `fetchProducts` |
| 삭제 204인데 화면 유지 | state 미갱신 | 위와 동일 |
| `useParams` id undefined | Route path 오타 | `App.tsx` 에 `:id` 있는지 |
| Link 클릭 시 풀 새로고침 | `<a href>` 만 사용 | 가급적 `<Link to=...>` |

### 디버깅 고정 순서

1. 백엔드 터미널에 에러 있나?  
2. 같은 URL을 **Postman** 으로 되나?  
3. 브라우저 Network 의 method / status / payload  
4. Console 빨간 에러  
5. 그다음 React state 의심  

---

# 부록 B. 학습 체크 (Work 끝내고 스스로 답하기)

Work를 끝낸 뒤, 말로 대답해 본다.

| 질문 | 답할 수 있으면 OK |
|------|-------------------|
| 등록은 왜 POST 인가? | 새 자원 생성 |
| 삭제 성공이 204인 이유? | body 없이 성공만 알림 |
| `navigate('/')` 를 쓰는 이유? | 등록/수정 후 목록으로 이동 |
| 삭제한 뒤 왜 목록을 다시 GET 하나? | 화면을 서버 데이터와 맞추려고 |
| `monthlyPremium` 을 `Number(...)` 로 바꾸는 이유? | JSON/API는 숫자 타입 |
| Entity를 프론트에서 직접 안 쓰는 이유? | API 계약은 DTO/타입으로 맞춤 |

---

# 부록 C. 폼 필드 ↔ DB 컬럼 (입력할 때 참고)

| 화면 라벨 | JSON / TS 필드 | DB 컬럼 | 필수 |
|-----------|----------------|---------|------|
| 상품명 | `name` | `name` | ✅ |
| 보험사 | `company` | `company` | ✅ |
| 유형 | `type` | `type` | ✅ |
| 월 보험료 | `monthlyPremium` | `monthly_premium` | ✅ |
| 설명 | `description` | `description` | ❌ |
| 상태 | `status` | `status` | ❌ (기본 판매중) |
| (자동) | — | `id` | 서버 |
| (자동) | — | `created_at` | 서버 |
| (자동) | — | `updated_at` | 서버 |

---

# 부록 D. 진행 체크리스트 (인쇄·복붙용)

```
[ ] Work 0  환경 기동
[ ] Work 1  create path 슬래시
[ ] Work 2  Postman CRUD 5종
[ ] Work 3  라우터 뼈대
[ ] Work 4  등록 UI
[ ] Work 5  삭제 UI
[ ] Work 6  수정 UI
[ ] Work 7  전체 시나리오 통과
[ ] (선택) Work 8 다듬기

→ 1단계 완료 후 2단계(로그인)로 이동
```

---

> **지금 당장 할 일**  
> 1. Work 0 으로 서버 두 개 켠다.  
> 2. Work 1 에서 path 한 글자 고친다.  
> 3. Work 2 Postman 통과 후 Work 3 → 4 로 진행한다.  
>  
> 막히면 이 매뉴얼 **부록 A** 만 보고, 그래도 안 되면 Network 캡처 기준으로 원인을 좁힌다.
