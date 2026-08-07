import { useEffect, useState } from 'react';
import { getInsuranceProducts } from '../api/insuranceProductApi.ts';
import type { InsuranceProductResponse } from '../types/insuranceProduct.ts';
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
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true); // 로딩 시작
                setError(null); // 에러 초기화

                // API 호출
                const data = await getInsuranceProducts();
                setProducts(data); // 상품 목록 state에 저장
            } catch (err) {
                console.error(err);
                setError('보험 상품 목록을 가져오는 중 오류가 발생했습니다.'); // 에러 상태 설정
            } finally {
                setLoading(false); // 로딩 종료
            }
        };
        fetchProducts(); // API 호출 함수 실행
    }, []);

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
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
export default InsuranceProductList;