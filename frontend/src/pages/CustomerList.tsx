// ============================================================
// 고객 목록 화면
// 흐름:
//   1) 들어오면 GET /api/customers
//   2) 표로 그림
//   3) 삭제 시 DELETE 후 목록 재조회
// ============================================================

import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

// API 함수
import {
  getCustomers, // GET 목록
  deleteCustomer, // DELETE 한 건
} from '../api/customerApi.ts';

// 응답 한 건의 타입
import type { CustomerResponse } from '../types/customer.ts';


function CustomerList() {
  // ---------- state (화면이 기억하는 값) ----------
  // 고객 배열, 처음엔 빈 배열
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  // true 면 "로딩 중..." 화면
  const [loading, setLoading] = useState<boolean>(true);
  // null 이면 에러 없음, 문자열이면 빨간 메세지
  const [error, setError] = useState<string | null>(null);

  // ---------- 서버에서 목록 가져오기 ----------
  // 처음 입장 + 삭제 성공 후 재사용
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      // await = 응답 올 때까지 잠깐 대기
      const data = await getCustomers();
      setCustomers(data);
    } catch(err) {
      console.error(err);
      setError('고객 목록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      // 성공/실패 상관없이 로딩종료
      setLoading(false);
    }
  }; 

  // 화면이 처음 나타날 때 1회 실행 ([] = 의존값 없음)
  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---------- 삭제 ----------
  const handleDelete = async (id: number, customerName: string) => {
    // 브라우저 기본 확인창, 취소면 false
    const ok = window.confirm(`"${customerName}" 고객을 삭제할까요?`);
    if (!ok) return;

    try {
      await deleteCustomer(id);
      // DB와 화면을 맞추기 위해 다시 목록 로드
      await fetchCustomers();
    } catch(err) {
      console.error(err);
      setError('삭제에 실패했습니다.');
    }
  };

  // ---------- 로딩 / 에러 전용 화면 ----------
  if (loading) {
    return <div style={{ padding: '20px' }}>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  // ---------- 정상 화면 ----------
  return(
    <div style={{ padding: '20px' }}>
      <h1>고객 목록</h1>
      <p>
        {/* SPA 이동: 전체 새로고침 없이 라우터만 바꿈 */}
      </p>
    </div>
  );
}

export default CustomerList;