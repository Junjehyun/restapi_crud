import axios from "axios";

/**
 * axios 인스턴스 생성
 *
 * [왜 인스턴스를 만드나요?]
 * - baseURL, 헤더 등을 한 곳에서 관리하기 위해서입니다.
 * - 나중에 모든 API 호출에서 이 인스턴스를 사용합니다.
 *
 * [baseURL]
 * - 백엔드 서버 주소입니다.
 * - 개발 중에는 http://localhost:8080 을 사용합니다.
 */
const api = axios.create({
    baseURL: 'http://localhost:8080', // 개발 환경에서의 백엔드 서버 주소
    headers: {
        'Content-Type': 'application/json', // 요청 본문이 JSON 형식임을 명시
    }
});

export default api;