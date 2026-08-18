package com.yama331.restapi_crud.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

/**
 * Request: 클라이언트가 보내는 것. id / createdAt없음
 * ConsultantRequest
 * 
 * 클라이언트가 보낸 JSON을 담는 그릇
 * Controller가 @RequestBody로 이 클래스를 받음. 
 * 
 * 이유는 자세히 모르지만 카멜 케이스로 작성해야 한다고함.
 * 
 */
@lombok.Getter
@lombok.Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultantRequest {

    private String name;
    
    private String employeeCode;

    private String phone;

    private String email;

    private LocalDate hireDate;

    private String status;

}
