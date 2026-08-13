package com.yama331.restapi_crud.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yama331.restapi_crud.dto.CustomerRequest;
import com.yama331.restapi_crud.dto.CustomerResponse;
import com.yama331.restapi_crud.service.CustomerService;

import lombok.RequiredArgsConstructor;

/**
 * 고객 REST API Controller
 *
 * [역할]
 * - 브라우저/Postman 의 HTTP 요청을 받는 첫 관문
 * - Service 에 일을 시키고, 결과를 HTTP 응답으로 돌려줌
 *
 * [URL 설계]
 * POST   /api/customers      → 등록
 * GET    /api/customers      → 전체 조회
 * GET    /api/customers/{id} → 단건 조회
 * PUT    /api/customers/{id} → 수정
 * DELETE /api/customers/{id} → 삭제
 *
 * [계층 규칙]
 * Controller → Service 만 호출
 * Controller 가 Repository 를 직접 부르지 않음
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    // 서비스 취득
    private final CustomerService customerService;

    /**
     * 고객 등록
     *
     * @param request JSON body → CustomerRequest
     * @return 201 Created + 저장된 고객 JSON
     */
    @PostMapping
    public ResponseEntity<CustomerResponse> create(
        @RequestBody CustomerRequest request
    ) {
        // JSON -> DTO 변환은 Spring이 해줌 (@RequestBody)
        CustomerResponse response = customerService.create(request);

        // 201 = "새로 만들었다" 는 의미의 성공 코드
        // 200 을 써도 동작은 하지만, REST 관례상 생성은 201 권장
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    /**
     * 전체 목록
     * @return 200 OK + 배열 JSON
     */
    @GetMapping
    public ResponseEntity<List<CustomerResponse>> findAll() {
        return ResponseEntity.ok(customerService.findAll());
    }

    /**
     * 단건 조회
     * URL 예: /api/customers/3  → id = 3
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> findById(
        @PathVariable Long id
    ) {
        // @PathVariable : 경로의 {id} 를 변수로 받음
        return ResponseEntity.ok(customerService.findById(id));
    }

    /**
     * 수정
     * URL 의 id = 누구를 고칠지
     * Body 의 JSON = 무엇으로 고칠지
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(
        @PathVariable Long id,
        @RequestBody CustomerRequest request
    ) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    /**
     * 삭제
     * 성공 시 204 No Content = "성공했지만 body 는 없음"
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    
}
