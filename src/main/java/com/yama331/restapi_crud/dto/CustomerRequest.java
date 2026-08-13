package com.yama331.restapi_crud.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

/**
 * 고객 등록/수정 요청 DTO
 *
 * [역할]
 * - 클라이언트가 보낸 JSON 을 담는 그릇
 * - Controller 가 @RequestBody 로 이 클래스를 받음
 *
 * [예시 JSON]
 * {
 *   "name": "김민수",
 *   "email": "minsu@example.com",
 *   "phone": "010-1111-2222",
 *   "birthDate": "1990-05-15",
 *   "address": "서울시 강남구",
 *   "status": "활성"
 * }
 *
 * [날짜 팁]
 * - JSON 문자열 "1990-05-15" → Java LocalDate 로 자동 변환 (Spring 기본)
 * - 프론트 input type="date" 값 형식과 딱 맞음
 */
@lombok.Getter
@lombok.Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerRequest {
    
    /** 고객 이름 (필수) */
    private String name;
    /** 이메일 (필수) */
    private String email;
    /** 연락처 (필수) */
    private String phone;
    /**
     * 생년월일 (선택)
     * 안 보내면 null
     */
    private LocalDate birthDate;
    /** 주소 (선택) */
    private String address;
    /**
     * 상태 (선택)
     * 안 보내면 Service/Entity 에서 "활성" 기본값
     */
    private String status;
    
}
