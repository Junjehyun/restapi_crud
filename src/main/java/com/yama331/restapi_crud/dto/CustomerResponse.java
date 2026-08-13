package com.yama331.restapi_crud.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.yama331.restapi_crud.entity.Customer;

import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * 고객 응답 DTO
 *
 * [역할]
 * - 서버가 클라이언트에게 돌려주는 JSON 모양
 * - Entity 를 그대로 주지 않고, 이 객체로 변환해서 줌
 *
 * [from 메서드]
 * - Entity → Response 변환을 한곳에 모아 둠
 * - Service 여러 곳에서 response = CustomerResponse.from(entity) 로 사용
 */
@lombok.Getter
@lombok.Setter
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String address;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Entity → Response 변환
     *
     * @param customer DB 에서 읽었거나 방금 저장한 Entity
     * @return 클라이언트에 줄 DTO
     */
    public static CustomerResponse from(Customer customer) {
        return CustomerResponse.builder()
        .id(customer.getId())
        .name(customer.getName())
        .email(customer.getEmail())
        .phone(customer.getPhone())
        .birthDate(customer.getBirthDate())
        .address(customer.getAddress())
        .status(customer.getStatus())
        .createdAt(customer.getCreatedAt())
        .updatedAt(customer.getUpdatedAt())
        .build();
    }

    
}
