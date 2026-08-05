package com.yama331.restapi_crud.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 보험 상품 등록/수정 요청 DTO
 *
 * [역할]
 * - 클라이언트가 보내는 JSON 데이터를 담는 객체입니다.
 * - Controller → Service로 데이터를 전달할 때 사용합니다.
 *
 * [Entity를 직접 안 쓰는 이유]
 * - Entity는 DB와 직접 연결되는 객체라서
 *   외부에서 받는 데이터와 분리하는 것이 좋습니다.
 */
@Getter
@Setter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor // 모든 필드를 매개변수로 받는 생성자
@Builder // 빌더 패턴을 적용하여 객체 생성 시 가독성을 높임
public class InsuranceProductRequest {
    
    /**
     * 상품명 (필수)
     */
    private String name;

    /**
     * 보험사 (필수)
     */
    private String company;

    /**
     * 상품 유형 (필수)
     * 예: 종신, 실손, 자동차, 연금
     */
    private String type;

    /**
     * 월 보험료 (필수)
     */
    private BigDecimal monthlyPremium;

    /**
     * 상품 설명 (선택)
     */
    private String description;

    /**
     * 판매 상태 (선택)
     * 안 보내면 Entity에서 기본값 "판매중"이 적용됩니다.
     */
    private String status;

}
