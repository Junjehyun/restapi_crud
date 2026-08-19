// ============================================================
// 설계사 수정 화면
// 흐름:
//   1) URL 의 :id 읽기
//   2) GET 으로 기존 데이터 → 폼 state 채우기
//   3) 사용자가 수정 → PUT → 목록 이동
// ============================================================
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    getConsultant,
    updateConsultant
} from '../api/consultantApi.ts';
import type { ConsultantRequest } from "../types/consultant.ts";


function ConsultantEdit() {
    // URL: /consultants/3/edit -> id = "3"
    const { id } = useParams();
    const navigate = useNavigate();

    // 문자열 id -> 숫자, 이상하면 NaN
    const consultantId = Number(id);
    // 폼 필드
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [hireDate, setHireDate] = useState('');
    const [employeeCode, setEmployeeCode] = useState('');
    const [status, setStatus] = useState('재직');

    // 처음 불러오는 중 / 저장 중
    const [initialLoading, setInitialLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<String | null>(null);

    // 기존 데이터 로드
     useEffect(() => {
        if(!id || Number.isNaN(consultantId)) {
          setError('잘못된 설계사 ID 입니다.');
          setInitialLoading(false);
          return;
        }

        // useEffect안에서 async 직접 선언 대신, 내부 함수 후 즉시 호출
        const load = async() => {
            try {
                setInitialLoading(true);
                setError(null);
                const data = await getConsultant(consultantId);

                // 서버 값 -> 각 input state
                setName(data.name);
                setEmail(data.email ?? '');
                setPhone(data.phone);
                setEmployeeCode(data.employeeCode);
                setHireDate(data.hireDate ?? '');
                setStatus(data.status);
            } catch(err) {
                console.error(err);
                setError('고객 정보를 불러오지 못했습니다.');
            } finally {
                setInitialLoading(false);
            }
        };
        load();
    }, [id, consultantId]);

    // 저장
    const handleSubmit = async(e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if(!name.trim() || !email.trim() || !phone.trim()) {
            setError('이름, 이메일, 연락처는 필수입니다!');
            return;
        }

        const body: ConsultantRequest = {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            employeeCode: employeeCode.trim(),
            hireDate: hireDate.trim(),
            status: status.trim()
        };

        try {
            setSaving(true);
            await updateConsultant(consultantId, body);
            navigate('/consultants');
        } catch(err) {
            console.error(err);
            setError('설계사 수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    }

    if(initialLoading) {
        return <div style={{ padding: '20px' }}>불러오는 중...</div>
    }

    return (
        <div style={{ padding: '20px', maxWidth: 560 }}>
            <h1>설계사 수정</h1>
            <p>
                <Link to="/consultants">설계사 목록</Link>
            </p>
        
            {error && (
                <div style={{ color:'red', marginBottom: 12}}>{error}</div>
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
                        이메일 {' '}
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
                        연락처 *{' '}
                        <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%' }}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        사번 *{' '}
                        <input
                            value={employeeCode}
                            onChange={(e) => setEmployeeCode(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        고용날짜 *{' '}
                    </label>
                    <input 
                        type="date"
                        value={hireDate}
                        onChange={(e) => setHireDate(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                <div>
                    <label>
                        상태 *{' '}
                    </label>
                        <select value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="재직">재직</option>
                        <option value="퇴직">퇴직</option>
                        <option value="휴직">휴직</option>
                    </select>
                </div>

                <button type="submit" disabled={saving}>
                    {saving? '저장 중..' : '저장하기'}
                </button>
            </form>
        </div>
    );
}

export default ConsultantEdit;