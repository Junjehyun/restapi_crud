import api from './axios.ts';
import type {
    InsuranceProductRequest,
    InsuranceProductResponse,
} from '../types/insuranceProduct';

/**
 * 보험 상품 API 함수 모음
 *
 * Backend의 Controller 엔드포인트와 1:1로 맞춰서 작성합니다.
 *
 * POST   /api/insurance-products      → 등록
 * GET    /api/insurance-products      → 전체 조회
 * GET    /api/insurance-products/{id} → 단건 조회
 * PUT    /api/insurance-products/{id} → 수정
 * DELETE /api/insurance-products/{id} → 삭제
 */

/**
 * 전체 조회
 */
export const getInsuranceProducts = async (): Promise<InsuranceProductResponse[]> => {
    const response = await api.get<InsuranceProductResponse[]>('/api/insurance-products');
    return response.data;
};

/**
 * 단건 조회
 */
export const getInsuranceProduct = async (id: number): Promise<InsuranceProductResponse> => {
    const response = await api.get<InsuranceProductResponse>(`/api/insurance-products/${id}`);
    return response.data;
};

/**
 * 등록
 */
export const createInsuranceProduct = async (
    data: InsuranceProductRequest
): Promise<InsuranceProductResponse> => {
    const response = await api.post<InsuranceProductResponse>('/api/insurance-products', data);
    return response.data;
};

/**
 * 수정
 */
export const updateInsuranceProduct = async (
    id: number,
    data: InsuranceProductRequest
): Promise<InsuranceProductResponse> => {
    const response = await api.put<InsuranceProductResponse>(`/api/insurance-products/${id}`, data);
        return response.data;
};

/**
 * 삭제
 */
export const deleteInsuranceProduct = async (id: number): Promise<void> => {
    await api.delete(`/api/insurance-products/${id}`);
};