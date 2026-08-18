// ============================================================
// 설계사 등록 화면
// 흐름: 입력 → 검사 → POST → 성공 시 목록(/consultants) 이동
// ============================================================
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createConsultant } from '../api/consultantApi.ts';
import type { ConsultantRequest } from '../types/consultant';

function ConsultantCreate() {
    // 성공 후 페이지 이동용
    const navigate = useNavigate();

    // -------- 폼 필드 state ----------
    // 규칙: const[값, 설정함수] = useState(초기값)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [employeeCode, setEmployeeCode] = useState('');
    // input type = date도 값은 문자열이다. "YYYY-MM-DD"
    const [hireDate, setHireDate] = useState('');
    const [status, setStatus] = useState('재직');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // --------- 제출 -----------
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        // HTML 기본 submit = 전체 새로고침, SPA 에서는 막는다.
        e.preventDefault();
        setError(null);

        // 1차 검증 (서버 가기 전)
        if(!name.trim()) {
            setError('이름을 입력하세요.');
            return;
        }
        if(!phone.trim()) {
            setError('연락처를 입력하세요.');
            return;
        }

        // 서버에 보낼 몸통 (POSTMAN JSON과 동일 개념)
        const body: ConsultantRequest = {
            name: name.trim(),
            employeeCode: employeeCode.trim(),
            phone: phone.trim(),
            status: status.trim(),
            // 빈 문자열이면 필드 생략
            hireDate: hireDate.trim() || undefined,
            email: email.trim() || undefined,
        };

        try {
            setLoading(true);
            await createConsultant(body);
            // if success -> /consultants
            navigate('/consultants');
        } catch(err) {
            console.error(err);
            setError('설계사 등록에 실패했습니다. 네트워크 탭과 서버 로그를 확인하세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: 560 }}>
            <h1>설계사 등록</h1>
            <p>
                <Link to="/consultants">설계사 목록</Link>
            </p>
            {/* error 가 있을 때만 빨간 박스 */}
            {error && (
                <div style={{ color:'red', marginBottom: 12 }}>{error}</div>
            )}
            <form onSubmit={handleSubmit}>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        이름 *{' '}
                         {/*
                            제어 컴포넌트:
                            value = state, onChange = state 갱신
                            → 입력칸에 보이는 글자 = React 가 알고 있는 값
                        */}
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%'}} 
                        />
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        사번 *{' '}
                        <input 
                            value={employeeCode}
                            onChange={(e) => setEmployeeCode(e.target.value)}
                            style={{ width: '100%'}} 
                        />
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        연락처 *{' '}
                        <input 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder='010-2016-8772'
                            style={{ width: '100%'}} 
                        />
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        이메일 {' '}
                        <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%' }} 
                        />
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        입사일 {' '}
                        <input 
                        type="date"
                        value={hireDate}
                        onChange={(e) => setHireDate(e.target.value)}
                        style={{ width: '100%' }} 
                        />
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        상태{' '}
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                        <option value="재직">재직</option>
                        <option value="휴직">휴직</option>
                        <option value="퇴직">퇴직</option>
                        </select>
                    </label>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? '등록 중..' : '등록하기' }
                </button>

            </form>
        </div>
    );
    
}

export default ConsultantCreate;