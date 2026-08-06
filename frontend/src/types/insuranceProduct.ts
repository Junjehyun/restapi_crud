/**
 * 보험 상품 관련 TypeScript 타입 정의
 *
 * Backend의 DTO와 맞춰서 작성합니다.
 * - Request  : 등록/수정할 때 보내는 데이터
 * - Response : 서버에서 받아오는 데이터
 */

/**
 * 등록/수정 요청 시 사용하는 타입
 * (Backend의 InsuranceProductRequest와 동일)
 */
export interface InsuranceProductRequest {
    name: string; // 상품명
    company: string; // 보험사
    type: string; // 보험 종류 (예: 생명보험, 자동차보험 등)
    monthlyPremium: number; // 월 보험료 Java의 BigDecimal → TS에서는 number로 다룸
    description?: string; // 상품 설명 (선택 사항) 선택값 (? 붙임)
    status?: string; // 선택값
}

/**
 * 서버에서 받아오는 응답 타입
 * (Backend의 InsuranceProductResponse와 동일)
 */
export interface InsuranceProductResponse {
    id: number; // 상품 ID
    name: string;
    company: string;
    type: string;
    monthlyPremium: number;
    description: string | null;
    status: string;
    createdAt: string;        // LocalDateTime → JSON에서는 문자열로 옴
    updatedAt: string;
}