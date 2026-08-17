// ============================================================
// 고객 수정 화면
// 흐름:
//   1) URL 의 :id 읽기
//   2) GET 으로 기존 데이터 → 폼 state 채우기
//   3) 사용자가 수정 → PUT → 목록 이동
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getCustomer,
  updateCustomer,
} from '../api/customerApi.ts';
import type { CustomerRequest } from '../types/customer.ts';

function CustomerEdit() {
  // URL: /customers/3/edit → id = "3"  
  const { id } = useParams();
  const navigate = useNavigate();

  // 문자열 id -> 숫자, 이상하면 NaN
  const customerId = Number(id);
  // 폼 필드
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthdate] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('활성');

  // 처음 불러오는 중 / 저장 중
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<String | null>(null);

  // 기존 데이터 로드
  useEffect(() => {
    if(!id || Number.isNaN(customerId)) {
      setError('잘못된 고객 ID 입니다.');
      setInitialLoading(false);
      return;
    }

    // useEffect안에서 async 직접 선언 대신, 내부 함수 후 즉시 호출
    const load = async() => {
      try {
        setInitialLoading(true);
        setError(null);
        const data = await getCustomer(customerId);

        // 서버 값 -> 각 input state
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        // null 이면 빈 문자열 (date input은 null대신 '')
        setBirthdate(data.birthDate ?? '');
        setAddress(data.address ?? '');
        setStatus(data.status);
      } catch(err) {
        console.error(err);
        setError('고객 정보를 불러오지 못했습니다.');
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id, customerId]);

  // 저장
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if(!name.trim() || !email.trim() || !phone.trim()) {
      setError('이름, 이메일, 연락처는 필수입니다!');
      return;
    }

    const body: CustomerRequest = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthDate: birthDate.trim() || undefined,
      address: address.trim() || undefined, 
      status: status || undefined,
    };

    try {
      setSaving(true);
      await updateCustomer(customerId, body);
      navigate('/customers');
    } catch(err) {
        console.error(err);
        setError('고객 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if(initialLoading) {
    return <div style={{ padding: '20px' }}>불러오는 중...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: 560 }}>
      <h1>고객 수정</h1>
      <p>
        <Link to="/customers">고객 목록</Link>
      </p>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            이름 *{' '}
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }} 
            />
          </label>
        </div>

        <div>
          <label>
            이메일 *{' '}
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }} 
            />
          </label>
        </div>

        <div>
          <label style={{ marginBottom: 12 }}>
            연락처*{' '}
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div>
          <label style={{ marginBottom: 12 }}>
            생년월일*{' '}
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </label>
        </div>

        <div>
          <label style={{ marginBottom: 12 }}>
            주소*{' '}
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div>
          <label style={{ marginBottom: 12 }}>
            상태*{' '}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={saving}>
          {saving? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  );
}

export default CustomerEdit;