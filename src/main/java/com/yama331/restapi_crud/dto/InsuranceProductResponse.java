package com.yama331.restapi_crud.dto;

import com.yama331.restapi_crud.entity.InsuranceProduct;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 보험 상품 응답 DTO
 *
 * [역할]
 * - 클라이언트에게 반환하는 데이터를 담는 객체입니다.
 * - Service → Controller → 클라이언트로 전달됩니다.
 *
 * [Entity를 그대로 반환하지 않는 이유]
 * - DB 구조가 외부에 노출되는 것을 방지합니다.
 * - 나중에 응답에 필요한 필드만 선택해서 보낼 수 있습니다.
 */
@Getter
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor // 모든 필드를 매개변수로 받는 생성자
@Builder // 빌더 패턴을 적용하여 객체 생성 시 가독성을 높임
public class InsuranceProductResponse {
    private Long id;
    private String name;
    private String company;
    private String type;
    private BigDecimal monthlyPremium;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Entity -> Response DTO 변환 메서드
     * 
     * Service에서 Entity를 조회한 후, 이 메서드를 사용해서 Response DTO로 변환합니다. 
     */
    public static InsuranceProductResponse from(InsuranceProduct insuranceProduct) {
        return InsuranceProductResponse.builder()
            .id(insuranceProduct.getId())
            .name(insuranceProduct.getName())
            .company(insuranceProduct.getCompany())
            .type(insuranceProduct.getType())
            .monthlyPremium(insuranceProduct.getMonthlyPremium())
            .description(insuranceProduct.getDescription())
            .status(insuranceProduct.getStatus())
            .createdAt(insuranceProduct.getCreatedAt())
            .updatedAt(insuranceProduct.getUpdatedAt())
            .build();
    }
}
