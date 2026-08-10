// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

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