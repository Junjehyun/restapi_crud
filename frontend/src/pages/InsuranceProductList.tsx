import { useEffect, useState } from 'react';
import { 
            getInsuranceProducts, // GET 목록
            deleteInsuranceProduct // DELETE 
        } from '../api/insuranceProductApi.ts';
import type { InsuranceProductResponse } from '../types/insuranceProduct.ts';
// Link = 페이지 이동용 링크 컴포넌트 (React Router)
// 일반 <a href="..."> 와 비슷하지만, 브라우저 전체 새로고침 없이 화면만 바꿈
import { Link } from 'react-router-dom';

/**
 * 보험 상품 목록 페이지
 *
 * [역할]
 * - 백엔드 API를 호출해서 보험 상품 목록을 가져온다
 * - 화면에 테이블로 보여준다
 */
function InsuranceProductList() {
    // 상품 목록을 저장할 state 
    const [products, setProducts] = useState<InsuranceProductResponse[]>([]);
    // 로딩 상태
    const [loading, setLoading] = useState<boolean>(true);
    // 에러 메세지
    const [error, setError] = useState<string | null>(null);

    /**
     * 컴포넌트가 처음 화면에 나타날 때 한 번 실행됨
     * (useEffect의 두 번째 인자 [] = 최초 1회만 실행)
     */
    //useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true); // 로딩 시작 (로딩 중..표시)
                setError(null); // 에러 초기화 (이전 에러 지우기)

                // API 호출 await = 서버 응답이 올 때까지 잠깐 기다림
                const data = await getInsuranceProducts();
                setProducts(data); // 받은 배열을 화면에 쓸 상품 목록 state에 저장
            } catch (err) {
                console.error(err); // 개발자 도구에 자세한 원인
                setError('보험 상품 목록을 가져오는 중 오류가 발생했습니다.'); // 에러 상태 설정
            } finally {
                setLoading(false); // 로딩 종료 (성공/실패와 관계없이)
            }
        };
    useEffect(() => {
        fetchProducts(); // API 호출 함수 실행
    }, []);

    // ------------------------------------------------------------
    // 삭제 버튼 클릭 시 실행
    // id = 지울 상품 번호, productName = 확인창에 보여 줄 이름
    // ------------------------------------------------------------
    const handleDelete = async (id: number, productName: string) => {
        // window.confirm = 브라우저 기본 "확인/취소" 창
        // 확인 -> true , 취소 -> false
        // 백틱 `...${변수}...` = 문자열 안에 변수 끼워 넣기 (템플릿 리터럴)
        const ok = window.confirm(`"${productName}" 상품을 삭제할까요?`);
        if (!ok) return;
        
        try {
            // DELETE /api/insurance-products/{id}
            await deleteInsuranceProduct(id);
            // DB에서 지워졌으니, 화면 목록도 다시 맞춰준다.
            // 안불러 오면, 서버에는 없는데 표에는 남아 보일 수 있음
            await fetchProducts();
        } catch(err) {
            console.error(err);
            setError('삭제에 실패했습니다.');
        }
    };

    // 로딩 중일 때 
    if (loading) {
        return <div style={{ padding: '20px' }}>로딩 중...</div>;
    }

    // 에러가 발생했을 때
    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>보험 상품 목록</h1>
            {/* to="/products/new" = App.tsx 에 등록한 등록 페이지 주소로 이동 */}
            <p>
                <Link to="/products/new" style={{ marginRight: 12 }}>상품 등록</Link>
                <Link to="/customers" style={{ marginRight: 12 }}>고객 관리</Link>
                <Link to="/consultants">설계사 관리</Link>
            </p>
            {products.length === 0 ? (
                <p>등록된 상품이 없습니다</p>
            ) : (
                <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%'}}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>상품명</th>
                            <th>보험사</th>
                            <th>유형</th>
                            <th>월보험료</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.company}</td>
                                <td>{product.type}</td>
                                <td>{product.monthlyPremium.toLocaleString()}원</td>
                                <td>{product.status}</td>
                                <td>
                                    {/*
                                        백틱 문자열로 URL 을 만든다.
                                        예: product.id 가 3 이면 → /products/3/edit
                                        App.tsx 의 path="/products/:id/edit" 와 짝이 맞아야 한다
                                    */}
                                    <Link to={`/products/${product.id}/edit`} style={{ marginRight:8 }}>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
export default InsuranceProductList;