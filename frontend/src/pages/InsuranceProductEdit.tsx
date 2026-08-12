// ============================================================
// 상품 수정 화면
// 흐름:
//   1) URL 에서 id 읽기
//   2) GET 으로 기존 상품 받아 폼에 채우기
//   3) 사용자가 고친 뒤 저장 → PUT → 목록으로 이동
// ============================================================

// useEffect = 화면이 뜬 뒤(또는 값이 바뀐 뒤) 부수 작업을 할 때
// useState = 입력값, 로딩, 에러 같은 "기억"
import { useEffect, useState } from "react";

// useParams = URL의 :id 꺼내기
// useNavigate = 저장 후 목록으로 보내기
// Link = 목록 링크
import { useNavigate, useParams, Link } from 'react-router-dom';

// 단건 조회(GET) + 수정(PUT)
import {
    getInsuranceProduct,
    updateInsuranceProduct,
} from '../api/insuranceProductApi.ts';

// 서버에 보낼 요청 몸통 타입 (등록과 같은 모양)
import type { InsuranceProductRequest } from "../types/insuranceProduct.ts";

function InsrunaceProductEdit() {
    // URL예 : /products/3/edit -> id는 문자열 "3"
    const { id } = useParams();
    // navigate('/') 를 호출하면 목록 주소로 이동한다
    // 라라벨 redirect()->route('...') 와 비슷한 역할
    const navigate = useNavigate();

    // API와 숫자 비교를 위해 문자열 id -> 숫자로 변환
    // "abc" 처럼 이상하면 Number.isNaN(productId) 가 true 가 된다
    const productId = Number(id);

    // ---------- 폼 필드 state (등록 화면과 같은 패턴) ----------
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [type, setType] = useState('종신');
    const [monthlyPremium, setMonthlyPremium] = useState<string>('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('판매중');

    // 처음 데이터를 불러오는 중인가? (true 면 "불러오는 중..." 화면)
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
        if(!id || Number.isNaN(productId)) {
            setError('잘못된 상품 ID 입니다.');
            setInitialLoading(false);
            return; // load () 를 호출하지 않음. 
        }

        // useEffect안에서 async를 직접 못 쓰므로, 안쪽에 함수를 만들고 바로 호출
        const load = async() => {
            try {
                setInitialLoading(true);
                setError(null);
                // GET /api/insurance-products/{id}
                const data = await getInsuranceProduct(productId);

                // 서버가 준 값을 각 입력 state에 넣으면 -> 폼에 글자가 채워진다.
                setName(data.name);
                setCompany(data.company);
                setType(data.type);
                // input value 는 보통 문자열과 잘 맞으므로 숫자를 문자열로
                setMonthlyPremium(String(data.monthlyPremium));
                // description 이 null 일 수 있음 → ?? '' 로 빈 문자열 대체
                // (A ?? B) = A 가 null 또는 undefined 이면 B, 아니면 A
                setDescription(data.description ?? '');
                setStatus(data.status);
            } catch(err) {
                console.error(err);
                setError('상품을 불러오지 못했습니다. ID를 확인하세요');
            } finally {
                setInitialLoading(false); // 로딩 끝 (성공이든 실패든)
            }
        };
        load();
    }, [id, productId]);

    // ============================================================
    // 수정 저장 (폼 submit)
    // ============================================================
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); // 페이지 새로고침 제출 막기
        setError(null);

        // 필수값 간단 검사 (등록과 동일 위치)
        if (!name.trim() || !company.trim() || !type.trim()) {
            setError('상품명, 보험사, 유형은 필수입니다!');
            return;
        }
        if (monthlyPremium === '' || Number.isNaN(monthlyPremium)) {
            setError('월 보험료를 숫자로 입력하세요');
            return;
        }
        // 서버에 보낼 JSON 몸통
        const body: InsuranceProductRequest = {
            name: name.trim(),
            company: company.trim(),
            type: type.trim(),
            monthlyPremium: Number(monthlyPremium),
            description: description.trim() || undefined,
            status: status.trim() || undefined,
        };

        try {
            setSaving(true);
            // PUT /api/insurance-products/{id} + body
            // 등록의 create(POST)와 달리, "어느 상품인지" ID가 꼭 필요
            await updateInsuranceProduct(productId, body);
            navigate('/'); // 성공 -> 목록
        } catch(err) {
            console.error(err);
            setError('수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    // ---------- 아직 서버 응답 전 ----------
    // early return: 여기서 화면을 끝낸다 (아래 폼 JSX 는 실행 안 됨)
    if(initialLoading) {
        return <div style={{ padding:20 }}>불러오는 중...</div>;
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
    return(
        <div style={{ padding: '20px', maxWidth: 560}}>
            {/* 지금 몇 번 상품을 고치는지 제목에 표시 */}
            <h1>상품 수정 (ID: {productId})</h1>
            <p>
                <Link to="/">목록으로</Link>
            </p>

            {/* 저장 검증 실패 등, 폼은 보이되 에러만 위에 표시 */}
            {error && (
                <div style={{ color:'red', marginBottom: 12}}>{error}</div>
            )}

            {/* 입력 칸 패턴은 등록(Work 4) 과 거의 같다: value + onChange */}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12}}>
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
                            style={{ width: '100%'}}
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

export default InsrunaceProductEdit;