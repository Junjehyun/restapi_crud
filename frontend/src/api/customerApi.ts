// axios 인스턴스 (baseURL 이 이미 localhost:8080)
import api from './axios.ts';

// 요청/응답 타입
import type {
  CustomerRequest,
  CustomerResponse,
} from '../types/customer.ts';

/**
 * 고객 API 함수 모음
 *
 * 백엔드 CustomerController 와 1:1
 *
 * POST   /api/customers      → 등록
 * GET    /api/customers      → 전체
 * GET    /api/customers/{id} → 단건
 * PUT    /api/customers/{id} → 수정
 * DELETE /api/customers/{id} → 삭제
 *
 * [path 앞에 슬래시 / 필수]
 * - baseURL 이 http://localhost:8080 일 때
 * - '/api/customers' → http://localhost:8080/api/customers  (올바름)
 * - 'api/customers'  → 상대경로가 꼬일 수 있음 (상품 때 겪었던 실수)
 */

/** 전체 목록 GET */
export const getCustomers = async () : Promise<CustomerResponse[]> => {
    // api.get<응답타입>(경로)
    // response.data 가 실제 JSON 본문 (배열)
    const response = await api.get<CustomerResponse[]>('/api/customers');
    return response.data;
}

/** 단건 GET */
export const getCustomer = async (id: number) : Promise<CustomerResponse> => {
    // 백틱 문자열로 id 삽입: /api/customers/3
    const response = await api.get<CustomerResponse>(`/api/customers/${id}`);
    return response.data;
}

/** 등록 POST */
export const createCustomer = async (
    data: CustomerRequest
) : Promise<CustomerResponse> => {
    // 두 번째 인자 data = Request Body (JSON)
    const response = await api.post<CustomerResponse>('/api/customers', data);
    return response.data;
}

/** 수정 PUT */
export const updateCustomer = async (
    id: number,
    data: CustomerRequest
) : Promise<CustomerResponse> => {
    const response = await api.put<CustomerResponse>(
        `/api/customers/${id}`,
        data
    );
    return response.data;
}

/** 삭제 DELETE — 본문 없음, 204 */
export const deleteCustomer = async (id: number) : Promise<void> => {
    // 반환 body 가 없으므로 response.data 를 안 써도 됨
    await api.delete(`/api/customers/${id}`);
}