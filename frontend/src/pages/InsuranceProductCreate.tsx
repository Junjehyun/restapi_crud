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
import { Link, useNavigate } from 'react-router-dom';

// API 호출 함수 (이미 프로젝트에 있음). 서버에 POST 한다.
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
    const [name, setName] = useState(''); // 상품명, 처음은 빈칸
    const [company, setCompany] = useState(''); // 보험사
    const [type, setType] = useState('종신'); // 유형, 기본값 종신보험
    // 보험료는 입력 중엔 문자열로 두는 편이 편하다. (빈 칸 "" 허용)
    // 서버로 보낼 때만 Number(...) 로 숫자로 바꾼다
    const [monthlyPremium, setMonthlyPremium] = useState<string>('');
    const [description, setDescription] = useState(''); // 설명 (선택)
    const [status, setStatus] = useState('판매중');

    // --------- 화면 상태 ---------
    const [loading, setLoading] = useState(false); // true면 "등록중..." (버튼 잠금)
    // error가 null이면 에러 없음, 문자열이면 빨간 글씨로 보여줌
    const [error, setError] = useState<string | null>(null);
    
    // ---------- 폼 제출 함수 ----------
    // async = 안에서 await(서버 응답 기다리기) 를 쓰겠다는 표시
    // e = 폼 이벤트 객체 (브라우저가 넘겨 줌)
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        // HTML 폼의 기본 동작 = 페이지 전체를 새로고침하여 제출
        // SPA 에서는 그걸 막고, 우리가 fetch/axios로 보낸다.
        e.preventDefault();
        setError(null); // 이전 에러 문구 지우기 

        // --- 프론트 필수값 검사 (서버 가기 전 1차 필터) ---
        // trim() = 앞뒤 공백 제거, 공백만 입력한 것도 빈 값으로 본다. 
        if (!name.trim()) {
            setError('상품명을 입력하세요.');
            return; // 여기서 끊고 서버로 안보냄. 
        }
        if (!company.trim()) {
            setError('보험사를 입력하세요.');
            return;
        }
        if(!type.trim()) {
            setError('유형을 입력하세요.');
            return;
        }
        // 빈 칸이거나, 숫자로 바꿨을 때 NaN(Not a Number) 이면 실패
        if (monthlyPremium === '' || Number.isNaN(Number(monthlyPremium))) {
            setError('월 보험료를 숫자로 입력하세요.');
            return;
        }

        // 서버에 보낼 몸통(body), Postman에서 넣던 JSON과 같은 내용
        const body: InsuranceProductRequest = {
            name: name.trim(),
            company: company.trim(),
            type: type.trim(),
            monthlyPremium: Number(monthlyPremium), // 문자열 -> 숫자
            // 설명이 비어 있으면 필드 자체를 안 보냄 (undefined)
            description: description.trim() || undefined,
            status: status || undefined,
        };

        try {
            setLoading(true); // 버튼 "등록중.." + 중복 클릭 방지
            // 서버에 POST, 실패하면 아래 catch로 점프
            await createInsuranceProduct(body);
            // 여기까지 왔으면 성공 -> 목록으로 이동
            navigate('/');
        } catch (err) {
            // 네트워크 오류, 500 등. 개발자 도구 Console 에도 찍어둠
            console.error(err);
            setError('상품 등록에 실패 했습니다. 서버 로그와 Network 탭을 확인하세요.');
        } finally {
            // 성공이든 실패든 항상 실행 -> 로딩 상태 해제
            setLoading(false);
        }
    };

    // ---- 화면 (JSX) ----
    return(
        <div style={{ padding: '20px', maxWidth: 560 }}>
            <h1>상품 등록</h1>
            <p>
                {/* Link = React Router 링크. <a href> 보다 SPA 이동에 맞음 */}
                <Link to="/">목록으로</Link>
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
                            onChange={(e) => setName(e.target.value )}
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
                        {/* select도 같은 패턴: value + onChange로 state와 연결 */}
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
                            min={0} // 0미만 입력 방지 (브라우저 힌트)
                            value={monthlyPremium}
                            onChange={(e) => setMonthlyPremium(e.target.value)}
                            style={{ width:'100%' }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        설명 *{' '}
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
                        상태 *{' '}
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
            {/*
                4-2. 목록에 “상품 등록” 버튼 넣기부터 시작하기. InsuranceProductList에!
                04_PRODUCT_CRUD_MANUAL 참고
             */}
        </div>
    );
}

export default InsuranceProductCreate;