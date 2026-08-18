// ============================================================
// 설계사 목록 화면
// 흐름:
//   1) 들어오면 GET /api/consultants
//   2) 표로 그림
//   3) 삭제 시 DELETE 후 목록 재조회
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// API 함수
import {
    getConsultants,
    deleteConsultant,
} from '../api/consultantApi.ts'

// 응답 한 건의 타입 response
import type { ConsultantResponse } from "../types/consultant.ts";

function ConsultantList() {
    // ---------- state (화면이 기억하는 값) ----------
    // 설계사 배열, 처음엔 빈 배열
    const [consultants, setConsultants] = useState<ConsultantResponse[]>([]);
    // true면 "로딩 중..." 화면
    const [loading, setLoading] = useState<boolean>(true);
    // null이면 에러 없음, 문자열이면 빨간 메세지
    const [error, setError] = useState<string | null>(null);

    // ------ 서버에서 목록 가져오기 -------
    // 처음 입장 + 삭제 성공 후 재사용
    const fetchConsultants = async () => {
        try {
            setLoading(true);
            setError(null);
            // await = 응답 올 때까지 잠깐 대기
            const data = await getConsultants();
            setConsultants(data);
        } catch(err) {
            console.error(err);
            setError('설계사 목록을 가져오는 중 오류가 발생했습니다.');
        } finally {
            // 성공 / 실패 상관없이 로딩 종료
            setLoading(false);
        }
    };

    // 화면이 처음 나타날 때 1회 실행 ([] = 의존값 없음)
    useEffect(() => {
        fetchConsultants();
    }, []);

    // ---------- 삭제 -----------
    const handleDelete = async (id: number, consultantName: string) => {
        // 브라우저 기본 확인창, 취소면 false
        const ok = window.confirm(`"${consultantName}" 설계사 삭제할까요?`);
        if(!ok) return;

        try {
            await deleteConsultant(id);
            // DB와 화면을 맞추기 위해 다시 목록 로드
            await fetchConsultants();
        } catch(err) {
            console.error(err);
            setError('삭제에 실패했습니다.');
        }
    };

    // ----------- 로딩 / 에러 전용 화면 ------------
    if (loading) {
        return <div style={{ padding: '20px' }}>로딩 중...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    //----------- 정상 화면 -------------
    return (
        <div style={{ padding: '20px' }}>
            <h1>
                설계사 목록
            </h1>
            <p>
                {/* SPA이동: 전체 새로고침 없이 라우터만 바꿈 */}
                <Link to="/consultants/new" style={{ marginRight:12 }}>
                    삼당사 등록
                </Link>
                <Link to="/" style={{ marginRight: 12 }}>상품 목록</Link>
                <Link to="/cusotmers">고객 목록</Link>
            </p>

            {consultants.length === 0 ? (
                <p>등록된 설계사 없습니다.</p>
            ) : (
                <table
                    border={1}
                    cellPadding={8}
                    style={{ borderCollapse: 'collapse', width: '100%'}}
                >
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>연락처</th>
                            <th>고용날짜</th>
                            <th>상태</th>
                            <th>컨설턴트 코드</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/*
                            map = 배열 각 요소를 <tr>로 반환
                            key ={consultant.id} = React가 행을 구분하느 고유값 (필수에 가깝)
                        */}
                        {consultants.map((consultant) => (

                            <tr key={consultant.id}>
                                <td>{consultant.id}</td>
                                <td>{consultant.email}</td>
                                <td>{consultant.phone}</td>
                                <td>{consultant.hireDate ?? '-'}</td>
                                <td>{consultant.status}</td>
                                <td>{consultant.employeeCode}</td>
                                <td>
                                    <Link
                                        to={`/consultants/${consultant.id}/edit`}
                                        style={{ marginRight: 8}}
                                    >
                                     수정
                                    </Link>
                                    <button type="button" onClick={() => handleDelete(consultant.id, consultant.name)}>
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
export default ConsultantList;