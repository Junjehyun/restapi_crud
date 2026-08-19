/**
 * 설계사 관련 TypeScript 타입
 *
 * 백엔드 DTO 와 "필드 이름"을 맞춘다.
 * - Request  : 등록/수정 때 보내는 몸통
 * - Response : 서버가 돌려주는 몸통
 *
 * [Java ↔ TypeScript 대응]
 * - String          → string
 * - Long / 숫자     → number
 * - LocalDate       → string  ("YYYY-MM-DD")  ※ JSON 에서는 문자열
 * - LocalDateTime   → string  (ISO 날짜시간 문자열)
 * - null 가능 필드  → string | null 또는 선택 속성 ?
 */

/**
 * 등록/수정 요청 타입
 * = 백엔드 ConsultantRequest(DTO)
 */
export interface ConsultantRequest {
    
    name: string;
    employeeCode: string;
    phone: string;
    email?: string;
    hireDate?: string;
    status: string;

}

/**
 * 서버 응답 타입
 * = 백엔드 ConsultantResponse
 */

export interface ConsultantResponse {
    id: number;
    name: string;
    employeeCode: string;
    phone: string;
    email: string | null;
    hireDate: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;

}