// axios 인스턴스 (baseURL 이 이미 localhost:8080)
import api from './axios.ts';

// 요청/응답 타입 
import type {
    ConsultantRequest,
    ConsultantResponse,
} from '../types/consultant.ts'

/**
 * 설계사 API 함수 모음
 *
 * 백엔드 ConsultantController 와 1:1
 *
 * POST   /api/consultants      → 등록
 * GET    /api/consultants      → 전체
 * GET    /api/consultants/{id} → 단건
 * PUT    /api/consultants/{id} → 수정
 * DELETE /api/consultants/{id} → 삭제
 *
 * [path 앞에 슬래시 / 필수]
 * - baseURL 이 http://localhost:8080 일 때
 * - '/api/consultants' → http://localhost:8080/api/consultants  (올바름)
 * - 'api/consultants'  → 상대경로가 꼬일 수 있음 (상품 때 겪었던 실수)
 */

/** 전체 목록 GET */
export const getConsultants = async() : Promise<ConsultantResponse[]> => {
    // api.get<응답타입>(경로)
    // response.data가 실제 JSON 본문 (배열)
    const response = await api.get<ConsultantResponse[]>('/api/consultants');
    return response.data;
}

/** 단건 GET */
export const getConsultant = async (id: number) : Promise<ConsultantResponse> => {
    // 백틱 문자열로 id 삽입: /api/consultants/3
    const response = await api.get<ConsultantResponse>(`/api/consultants/${id}`);
    return response.data;
}

/** 등록 POST */
export const createConsultant = async (
    data: ConsultantRequest
) : Promise<ConsultantResponse> => {
    // 두 번째 인자 data = Request Body (JSON)
    const response = await api.post<ConsultantResponse>('/api/consultants', data);
    return response.data;
}

/** 수정 PUT */
export const updateConsultant = async (
    id: number,
    data: ConsultantRequest
) : Promise<ConsultantResponse> => {
    const response = await api.put<ConsultantResponse>(
        `/api/consultants/${id}`,
        data
    );
    return response.data;
}

/** 삭제 DELETE — 본문 없음, 204 */
export const deleteConsultant = async(id: number) : Promise<void> => {
    // 반환 body가 없으므로 response.data를 안써도 됨
    await api.delete(`/api/consultants/${id}`);
}