// ============================================================
// 고객 등록 화면
// 흐름: 입력 → 검사 → POST → 성공 시 목록(/customers) 이동
// ============================================================
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCustomer } from '../api/customerApi.ts';
import type { CustomerRequest } from '../types/customer.ts';

function CustomerCreate() {
  // 성공 후 페이지 이동용
  const navigate = useNavigate();  

  // ---------- 폼 필드 state ----------
  // 규칙: const [값, 설정함수] = useState(초기값)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // input type="date" 도 값은 문자열 "YYYY-MM-DD"
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('활성');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- 제출 ----------
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    // HTML 기본 submit = 전체 새로고침, SPA 에서는 막는다.
    e.preventDefault();
    setError(null);

    // 1차 검증 (서버 가기 전)
    if (!name.trim()) {
      setError('이름을 입력하세요.');
      return;
    }
    if(!email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }
    if(!phone.trim()) {
      setError('연락처를 입력하세요.');
    }

    // 서버에 보낼 몸통 (Postman JSON 과 동일 개념)
    const body: CustomerRequest = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      // 빈 문자열이면 필드 생략 
      birthDate: birthDate.trim() || undefined,
      address: address.trim() || undefined,
      status: status || undefined
    };

    try {
      setLoading(true);
      await createCustomer(body);
      // if success -> /customers
      navigate('/customers');
    } catch(err) {
      console.error(err);
      setError('고객 등록에 실패했습니다. 네트워크 탭과 서버 로그를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: 560 }}>
      <h1>고객 등록</h1>
      <p>
        <Link to="/customers">고객 목록</Link>
      </p>
      {/* error 가 있을 때만 빨간 박스 */}
      
    </div>
  );



}

export default CustomerCreate;