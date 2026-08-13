// BrowserRouter, Routes, Route = URL ↔ 화면 연결 도구
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 각 페이지 컴포넌트 (방 3개) 를 불러온다
import InsuranceProductList from './pages/InsuranceProductList.tsx';
import InsuranceProductCreate from './pages/InsuranceProductCreate.tsx';
import InsuranceProductEdit from './pages/InsuranceProductEdit.tsx';
// about customer
import CustomerList from './pages/CustomerList.tsx';
import CustomerCreate from './pages/CustomerCreate.tsx';
import CustomerEdit from './pages/CustomerEdit.tsx';

function App() {
  return (
    // BrowserRouter: 브라우저 주소창을 보고 화면을 바꿀 수 있게 감싸 주는 통
    // 이 통 안에 있는 Route 들만 "주소 따라 화면 바꾸기" 가 동작한다
    <BrowserRouter>
      {/* Routes: "아래 규칙 중 하나에 맞춰라" 라고 묶는 상자 */}
      <Routes>
        {/* 상품 */}
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

        {/* 고객 */}
        {/* 목록 */}
        <Route path="/customers" element={<CustomerList />} />
        {/* 등록 — "new" 를 :id 보다 위에 두는 편이 안전 (관례) */}
        <Route path="/customers/new" element={<CustomerCreate />} />
        {/* 수정 — :id 자리 표시자 */}
        <Route path="/customers/:id/edit" element={<CustomerEdit />} />

      </Routes>
    </BrowserRouter>
  );
}

// main.tsx 등이 이 App 을 최상단으로 그린다
export default App;