/**
 * 고객 관련 TypeScript 타입
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
 * = 백엔드 CustomerRequest
 */
export interface CustomerRequest {
    name: string; // 필수 이름
    email: string; // 필수 이메일
    phone: string; // 필수 연락처
    birthDate?: string; // 선택: "1990-05-15" 형식. ? = 없어도됨.
    address?: string; // 선택: 주소
    status?: string; // 선택: 안 보내면 서버 기본값 "활성"
}

/**
 * 서버 응답 타입
 * = 백엔드 CustomerResponse
 */
export interface CustomerResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    birthDate: string | null; // 서버가 null 줄 수 있음.
    address: string | null; 
    status: string;
    createdAt: string; // LocalDateTime -> JSON문자열
    updatedAt: string;
}