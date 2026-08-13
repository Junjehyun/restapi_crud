# SPA란? (이 프로젝트 기준으로 보는 초보 가이드)

| 항목 | 내용 |
|------|------|
| 대상 | 프론트·웹 구조를 처음 배우는 사람 |
| 질문 | 우리 프로젝트에 SPA가 적용되어 있나? |
| 한 줄 답 | **예. `frontend/` 전체가 React SPA 입니다.** |
| 관련 코드 | `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/pages/` |

이 문서는 이론만 나열하지 않습니다.  
**이 저장소에 이미 있는 파일·주소·클릭 동작**을 보면서 SPA를 이해합니다.

---

## 1. 먼저 결론

**SPA는 적용되어 있습니다.** 따로 “켜는 스위치”가 있는 게 아닙니다.

우리 화면은 Spring이 HTML을 새로 내려주는 방식이 아닙니다.  
브라우저는 `frontend/` 의 React 앱을 **한 번 받고**, 그다음부터는:

- 주소창만 바꾸고
- 화면의 일부(컴포넌트)만 갈아끼우고
- 데이터는 Spring REST API에서 **JSON** 으로 받아옵니다.

```
브라우저 (http://localhost:5173)
        │
        │  처음 1번: HTML + JS 통째로 받음
        ▼
   React SPA  (화면 담당)
        │
        │  이후: JSON만 주고받음
        ▼
 Spring Boot  (http://localhost:8080)
        │
        ▼
      MySQL
```

Laravel Blade처럼 “버튼을 누를 때마다 서버가 새 HTML 페이지를 그려서 보내는” 구조가 **아닙니다**.

---

## 2. SPA가 뭔가요? (일상 비유)

**SPA = Single Page Application = 단일 페이지 애플리케이션**

이름을 풀어 보면 이렇습니다.

| 단어 | 뜻 |
|------|----|
| Single | 하나 |
| Page | 페이지 (브라우저가 처음 받는 HTML 문서) |
| Application | 그 안에서 돌아가는 앱 |

핵심은 **HTML 파일이 하나**라는 점입니다.

### 2.1 아파트 비유

전통적인 웹(MPA, Multi Page Application)은 **방마다 현관이 따로** 있는 집입니다.

- 목록 방을 보려면 목록 집 문을 열고 들어간다
- 등록 방을 보려면 밖으로 나와 등록 집 문을 다시 연다
- 문을 열 때마다 집 전체가 새로 생긴다 (페이지 전체 새로고침)

SPA는 **현관이 하나인 아파트**입니다.

- 현관(`index.html`)으로 한 번만 들어온다
- 그 안에서 목록 방, 등록 방, 수정 방으로 **이사만** 한다
- 건물 자체는 안 무너진다 (전체 새로고침이 없다)

우리 프로젝트의 현관이 바로 이 파일입니다.

```9:13:frontend/index.html
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
```

눈에 보이는 내용이 거의 없습니다. `<div id="root"></div>` 만 있습니다.  
진짜 화면은 React가 이 빈 칸 안에 **나중에 그려 넣습니다**.

`main.tsx`가 그 작업을 합니다.

```1:10:frontend/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

정리하면:

1. 브라우저가 `index.html` 을 받는다 (페이지는 이 한 장)
2. `main.tsx` 가 `#root` 에 `App` 을 붙인다
3. `App.tsx` 가 주소에 맞는 **방(페이지 컴포넌트)** 을 골라 보여 준다

이게 SPA입니다.

---

## 3. 예전 방식(MPA)과 뭐가 다른가

초보가 제일 헷갈리는 지점입니다. “주소가 바뀌면 페이지가 바뀌는 거 아닌가?”  
맞습니다. 다만 **누가 HTML을 다시 주느냐**가 다릅니다.

### 3.1 전통 방식 (MPA) — Laravel Blade에 가깝다

```
클릭 "상품 등록"
   → 브라우저가 /products/new 를 서버에 요청
   → 서버가 새 HTML 전체를 만들어서 보냄
   → 화면이 하얗게 깜빡이며 통째로 교체됨
```

서버가 **화면(HTML)** 을 그립니다.

### 3.2 우리 방식 (SPA)

```
클릭 "상품 등록"
   → React Router가 주소만 /products/new 로 바꿈
   → HTML은 그대로, 화면 컴포넌트만 InsuranceProductCreate 로 교체
   → 필요할 때만 Spring 에 JSON 을 요청 (목록, 저장, 수정, 삭제)
```

서버(Spring)는 **데이터(JSON)** 만 줍니다. 화면은 React가 그립니다.

| 비교 | MPA (Blade 등) | 우리 SPA |
|------|----------------|----------|
| HTML을 주는 쪽 | 서버 | 처음 한 번만 Vite/React |
| 페이지 이동 | 전체 새로고침 | 컴포넌트 교체 |
| 화면이 깜빡이나 | 보통 깜빡임 | 거의 안 깜빡임 |
| 서버 역할 | HTML + 데이터 | JSON API만 |
| 이 프로젝트 위치 | (없음) | `frontend/` |
| 백엔드 역할 | 뷰까지 담당 | `src/` 의 REST API |

`docs/PROJECT.md` 에 이미 같은 말이 있습니다.

> Laravel은 종종 한 앱 안에서 라우트 → 뷰까지 처리한다.  
> 여기서는 **프론트가 UI**, **백엔드가 API만** 담당한다.

---

## 4. “우리 게 SPA다”라고 말할 수 있는 증거

파일 몇 개만 보면 됩니다.

| 증거 | 어디에 있나 | 의미 |
|------|-------------|------|
| HTML이 사실상 한 장 | `frontend/index.html` | 단일 페이지의 “껍데기” |
| React가 화면을 그림 | `frontend/src/main.tsx` | `#root` 안에 앱을 장착 |
| 주소 ↔ 화면 연결 | `frontend/src/App.tsx` | `BrowserRouter` + `Route` |
| 새로고침 없는 링크 | 각 페이지의 `<Link>` | `<a href>` 대신 SPA 이동 |
| 코드로 이동 | `useNavigate()` | 저장 성공 후 목록으로 |
| 폼이 페이지를 안 깨움 | `e.preventDefault()` | HTML 기본 submit(새로고침) 차단 |
| 데이터는 JSON | `frontend/src/api/` | axios로 Spring 호출 |
| 의존성 | `frontend/package.json` | `react`, `react-router-dom`, `axios` |

`package.json` 의 핵심만 보면:

- `react` / `react-dom` → 화면을 그리는 엔진
- `react-router-dom` → SPA 라우팅 (주소로 방 바꾸기)
- `axios` → 백엔드에 JSON 요청

이 세 가지가 붙어 있으면, 이 프론트는 **전형적인 React SPA** 입니다.

---

## 5. 현재 프로젝트에 기록된 SPA 페이지

페이지 목록의 **공식 기록 장소**는 `frontend/src/App.tsx` 입니다.  
라라벨의 `routes/web.php`, 장고의 `urls.py` 와 같은 역할입니다.

```135:160:frontend/src/App.tsx
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

지금 **보험상품 화면 3개**가 SPA 페이지로 등록되어 있습니다.

### 5.1 페이지 지도

| 브라우저 주소 | 파일 | 하는 일 | 백엔드 API |
|---------------|------|---------|------------|
| `/` | `pages/InsuranceProductList.tsx` | 목록 보기, 삭제 | `GET /api/insurance-products` · `DELETE /api/insurance-products/{id}` |
| `/products/new` | `pages/InsuranceProductCreate.tsx` | 새 상품 등록 | `POST /api/insurance-products` |
| `/products/:id/edit` | `pages/InsuranceProductEdit.tsx` | 기존 상품 수정 | `GET /api/insurance-products/{id}` · `PUT /api/insurance-products/{id}` |

`:id` 는 자리 표시자입니다.

- `/products/1/edit` → 1번 상품 수정
- `/products/99/edit` → 99번 상품 수정

같은 화면 파일(`InsuranceProductEdit.tsx`)을 쓰고, 숫자만 `useParams()` 로 꺼냅니다.

### 5.2 폴더로 보면

```
frontend/
├── index.html                 ← HTML 껍데기 (페이지 1장)
└── src/
    ├── main.tsx               ← #root 에 앱 장착
    ├── App.tsx                ← SPA 라우터 (주소 ↔ 화면)
    ├── api/
    │   ├── axios.ts           ← HTTP 클라이언트 설정
    │   └── insuranceProductApi.ts  ← 상품 CRUD 함수
    ├── types/
    │   └── insuranceProduct.ts     ← JSON 모양(타입)
    └── pages/                 ← SPA "방" 들
        ├── InsuranceProductList.tsx
        ├── InsuranceProductCreate.tsx
        └── InsuranceProductEdit.tsx
```

**페이지 = `pages/` 안의 컴포넌트 하나.**  
서버가 내려주는 `.html` 파일이 페이지가 아닙니다.

### 5.3 아직 없는 것

설계 문서(`CUSTOMER_DESIGN.md`)에는 나중에 고객 화면(`/customers/...`)을 같은 방식으로 넣을 계획이 있습니다.  
**지금 `App.tsx` 에 등록된 SPA 페이지는 보험상품 3개뿐입니다.**

---

## 6. 클릭 한 번에 실제로 무슨 일이 일어나나

가장 쉬운 동선으로 따라가 봅니다.

### 장면 1. 목록에서 “상품 등록”을 누른다

목록 페이지에 이런 링크가 있습니다.

```86:89:frontend/src/pages/InsuranceProductList.tsx
            <p>
                <Link to="/products/new">상품 등록</Link>
            </p>
```

일반 `<a href="/products/new">` 를 쓰면 브라우저가 **문서 전체를 다시 받습니다.**  
`<Link>` 는 그걸 막고, React Router에게만 “주소 바꿔 줘” 라고 말합니다.

순서:

1. 주소창이 `http://localhost:5173/` → `http://localhost:5173/products/new`
2. `App.tsx` 가 `path="/products/new"` 규칙을 찾음
3. `InsuranceProductList` 를 치우고 `InsuranceProductCreate` 를 그림
4. Spring에는 아직 아무 요청도 안 감 (등록 폼은 빈 칸만 있으면 됨)
5. 화면이 하얗게 깜빡이지 않음

### 장면 2. 등록 폼에서 “등록하기”를 누른다

여기서 SPA의 두 번째 핵심이 나옵니다.

```51:54:frontend/src/pages/InsuranceProductCreate.tsx
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        // HTML 폼의 기본 동작 = 페이지 전체를 새로고침하여 제출
        // SPA 에서는 그걸 막고, 우리가 fetch/axios로 보낸다.
        e.preventDefault();
```

HTML 폼의 원래 습관은 “제출하면 페이지를 통째로 다시 여는 것”입니다.  
SPA에서는 그게 사고입니다. 입력값이 날아가고, 앱이 처음부터 다시 시작됩니다.

그래서:

1. `e.preventDefault()` 로 새로고침을 막는다
2. axios로 `POST /api/insurance-products` (JSON) 를 보낸다
3. 성공하면 `navigate('/')` 로 목록 화면만 다시 연다

```91:93:frontend/src/pages/InsuranceProductCreate.tsx
            await createInsuranceProduct(body);
            // 여기까지 왔으면 성공 -> 목록으로 이동
            navigate('/');
```

`navigate('/')` 도 `<Link>` 와 같습니다. **코드로 하는 SPA 이동**입니다.  
라라벨의 `redirect()->route(...)` 느낌입니다. 다만 서버 리다이렉트가 아니라, 브라우저 안의 라우터가 방을 바꿉니다.

### 장면 3. 목록에서 “수정”을 누른다

```120:122:frontend/src/pages/InsuranceProductList.tsx
                                    <Link to={`/products/${product.id}/edit`} style={{ marginRight:8 }}>
                                        수정
                                    </Link>
```

예: 3번 상품이면 `/products/3/edit` 로 갑니다.

수정 페이지는 빈 폼이 아니라 **기존 값**이 필요합니다.  
그래서 화면에 들어온 뒤 API를 한 번 더 호출합니다.

```13:16:frontend/src/pages/InsuranceProductEdit.tsx
// useParams = URL의 :id 꺼내기
// useNavigate = 저장 후 목록으로 보내기
// Link = 목록 링크
import { useNavigate, useParams, Link } from 'react-router-dom';
```

1. `useParams()` 로 URL의 `3` 을 읽는다
2. `GET /api/insurance-products/3` 으로 JSON을 받는다
3. input에 값을 채운다
4. 저장하면 `PUT` 후 `navigate('/')`

**화면 이동(라우터)** 과 **데이터 가져오기(API)** 가 분리되어 있습니다.  
이게 SPA에서 가장 중요한 감각입니다.

### 장면 4. “삭제”는 페이지 이동이 아니다

삭제는 다른 방으로 이사하지 않습니다. **같은 목록 방 안에서** 데이터만 고칩니다.

1. 확인 창
2. `DELETE /api/insurance-products/{id}`
3. 목록을 다시 불러와 표만 갱신

주소는 계속 `/` 입니다. SPA 페이지가 바뀐 게 아니라, 그 페이지의 **state** 가 바뀐 것입니다.

---

## 7. SPA에서 자주 만나는 단어 (이 코드 기준)

어려운 단어를 우리 파일에 대입합니다.

| 용어 | 쉬운 말 | 이 프로젝트에서 |
|------|---------|-----------------|
| SPA | HTML 한 장 + JS가 화면을 계속 바꿈 | `frontend/` 전체 |
| CSR (Client Side Rendering) | 브라우저(클라이언트)가 화면을 그림 | React가 `#root`에 그림 |
| Router | 주소와 화면을 짝지어 주는 안내데스크 | `App.tsx` 의 `BrowserRouter` |
| Route | “이 주소면 이 방” 규칙 한 줄 | `<Route path="..." />` |
| Page 컴포넌트 | 방 하나 | `pages/*.tsx` |
| `Link` | 새로고침 없는 `<a>` | 목록↔등록↔수정 링크 |
| `useNavigate` | 코드로 방 옮기기 | 저장 후 목록 |
| `useParams` | 주소에서 변수 꺼내기 | `/products/:id/edit` 의 id |
| `preventDefault` | 브라우저 기본 행동 취소 | 폼 제출 시 새로고침 방지 |
| REST API | JSON으로 하는 CRUD 약속 | `/api/insurance-products` |
| axios | JS에서 HTTP 요청 보내는 도구 | `frontend/src/api/` |
| state | 화면이 기억하는 값 | `useState` (목록, 입력칸, 로딩, 에러) |

한 문장으로 줄이면:

> **라우터가 방을 바꾸고, axios가 짐을(데이터) 나른다.**

---

## 8. 직접 눈으로 확인해 보기

글로만 보지 말고, 브라우저로 한 번 확인하면 개념이 고정됩니다.

### 8.1 서버 두 개

```bash
# 터미널 1 — 백엔드 (데이터)
./gradlew bootRun

# 터미널 2 — 프론트 (화면)
cd frontend
npm run dev
```

브라우저: `http://localhost:5173`

### 8.2 확인 포인트

1. 목록에서 **상품 등록**을 누른다.
2. 주소는 `/products/new` 로 바뀌지만, 화면이 **하얗게 깜빡이지 않는지** 본다.
3. 개발자 도구(F12) → **Network** 탭을 연다.
   - 페이지 이동 직후 새 `index.html` 이 다시 받아지지 않는다.
   - 등록 버튼을 눌러야 `/api/insurance-products` 요청이 생긴다.
4. 개발자 도구 → **Elements**(또는 검사).
   - 항상 `<div id="root">` 안에 내용만 바뀐다.
   - HTML 문서 자체가 통째로 바뀌지 않는다.

이게 “단일 페이지”의 실체입니다.

### 8.3 일부러 깨 보면 더 잘 이해된다

등록 페이지에서 `e.preventDefault()` 를 잠깐 주석 처리하고 제출해 보세요.

- 화면이 새로고침되고
- 입력이 날아가거나
- 주소에 쿼리가 붙는 등 HTML 폼 기본 동작이 살아납니다.

다시 살리면 “아, SPA는 브라우저 기본 이동을 막고 우리가 직접 처리하는 거구나”가 몸으로 남습니다.  
확인이 끝나면 반드시 원래대로 되돌리세요.

---

## 9. 초보가 자주 헷갈리는 점

### Q1. 주소가 여러 개인데 왜 Single Page인가요?

주소(URL)는 여러 개여도 됩니다.  
**서버가 내려주는 HTML 문서가 하나**라는 뜻입니다.

`/`, `/products/new`, `/products/3/edit` 모두 같은 `index.html` + 같은 React 앱입니다.  
라우터가 URL을 보고 안쪽 화면만 바꿉니다.

### Q2. Spring도 페이지를 만드나요?

이 프로젝트의 Spring은 **페이지를 만들지 않습니다.**  
`@RestController` 가 JSON만 줍니다.

| 포트 | 누가 | 무엇을 |
|------|------|--------|
| 5173 | Vite + React | 사람 눈에 보이는 화면 |
| 8080 | Spring Boot | 데이터 API |

Postman으로 `http://localhost:8080/api/insurance-products` 를 치면 JSON이 옵니다.  
HTML 목록 페이지가 오지 않습니다.

### Q3. `pages/` 폴더가 있으면 멀티 페이지 아닌가요?

폴더 이름일 뿐입니다.  
개발자가 “이 컴포넌트는 화면 하나 분량”이라고 구분해 둔 것입니다.  
빌드 결과물 기준으로는 여전히 SPA입니다.

### Q4. F5(새로고침)를 누르면요?

그때는 브라우저가 `index.html` 을 **다시** 받습니다.  
앱이 처음부터 시작됩니다. 그때까지 화면에만 있던 입력값(아직 저장 안 한 것)은 사라집니다.  
DB에 저장된 데이터는 API로 다시 불러옵니다.

### Q5. 나중에 고객 화면을 추가하면 SPA가 깨지나요?

아닙니다. `App.tsx` 에 `<Route>` 를 한 줄 더 넣으면 방이 하나 늘어날 뿐입니다.  
아파트에 호실이 늘어나는 것과 같습니다.

---

## 10. 한 장 요약

```
index.html          현관 1개 (빈 홀 + root)
     │
main.tsx            홀에 앱을 설치
     │
App.tsx             안내데스크 (주소 → 방)
     │
     ├── /                  목록 방   InsuranceProductList
     ├── /products/new      등록 방   InsuranceProductCreate
     └── /products/:id/edit 수정 방   InsuranceProductEdit

방은 React가 그리고,
짐(데이터)은 axios가 Spring(8080)에서 나른다.
```

**우리 프로젝트는 SPA가 적용되어 있고, 그 사례는 보험상품 목록·등록·수정 화면 3개입니다.**

---

## 11. 다음에 읽으면 좋은 문서

| 문서 | 언제 |
|------|------|
| `docs/PROJECT.md` | 왜 React SPA + Spring API 로 나눴는지 |
| `docs/PHASE1_DESIGN.md` | 화면과 API가 어떻게 짝을 이루는지 |
| `docs/PHASE1_MANUAL.md` | 등록·수정·삭제 UI를 어떻게 만들었는지 |
| `docs/CRUD_LEARNING_GUIDE.md` | CRUD 전체 흐름 |

코드를 볼 때는 이 순서가 편합니다.

1. `frontend/index.html` — 페이지가 하나인 이유
2. `frontend/src/App.tsx` — SPA 페이지 목록
3. `frontend/src/pages/InsuranceProductList.tsx` — `Link` 로 이동
4. `frontend/src/pages/InsuranceProductCreate.tsx` — `preventDefault` + `navigate`
5. `frontend/src/api/insuranceProductApi.ts` — 화면이 아니라 데이터를 요청하는 곳
