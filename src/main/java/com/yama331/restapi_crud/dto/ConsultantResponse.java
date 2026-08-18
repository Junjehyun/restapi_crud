package com.yama331.restapi_crud.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.yama331.restapi_crud.entity.Consultant;

import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * 서버가 클라이언트에게 돌려주는 JSON
 * Entity를 그대로 주지 않고, 이 객체로 변환해서 줌
 * 
 * 
 * ConsultantResponse
 */
@lombok.Getter
@lombok.Setter
@AllArgsConstructor
@Builder
public class ConsultantResponse {
    private Long id;
    private String name;
    private String employeeCode;
    private String phone;
    private String email;
    private LocalDate hireDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Entity -> Response 반환
     * 
     * @param consultant DB에서 읽었거나 방금 저장한 Entity
     * @return 클라이언트에 줄 DTO
     */
    public static ConsultantResponse from(Consultant consultant) {
        return ConsultantResponse.builder()
            .id(consultant.getId())
            .name(consultant.getName())
            .employeeCode(consultant.getEmployeeCode())
            .phone(consultant.getPhone())
            .email(consultant.getEmail())
            .hireDate(consultant.getHireDate())
            .status(consultant.getStatus())
            .createdAt(consultant.getCreatedAt())
            .updatedAt(consultant.getUpdatedAt())
            .build();
    }
}
