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
            <p>상품 ID : {id}</p>
            <p>Work 6에서 폼 만듬.</p>
            <a href="/">목록으로</a>
        </div>
    );
}
// 다른 파일(App.tsx)에서 이 화면을 import 해서 쓸 수 있게 "내보내기"
// 라라벨의 return view('...') 에 대응하는 "이 화면 쓸 수 있게 공개" 단계
export default InsuranceProductEdit;