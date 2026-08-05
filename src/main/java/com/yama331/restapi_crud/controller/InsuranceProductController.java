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

import com.yama331.restapi_crud.dto.InsuranceProductRequest;
import com.yama331.restapi_crud.dto.InsuranceProductResponse;
import com.yama331.restapi_crud.service.InsuranceProductService;
import lombok.RequiredArgsConstructor;

/**
 * 보험 상품 REST API Controller
 *
 * [역할]
 * - 클라이언트의 HTTP 요청을 받는 진입점.
 * - 요청 데이터를 Service에 전달하고,
 *   Service가 처리한 결과를 클라이언트에게 반환.
 *
 * [REST API URL 설계]
 * - POST   /api/insurance-products      → 상품 등록
 * - GET    /api/insurance-products      → 전체 조회
 * - GET    /api/insurance-products/{id} → 단건 조회
 * - PUT    /api/insurance-products/{id} → 수정
 * - DELETE /api/insurance-products/{id} → 삭제
 */

@RestController // @Controller + @ResponseBody → 반환값을 JSON으로 자동 변환
@RequestMapping("/api/insurance-products") // 이 컨트롤러의 기본 URL 경로를 지정함.
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 생성해주는 Lombok 어노테이션
public class InsuranceProductController {
    
    /**
     * Service 의존성 주입
     * Controller는 Service만 호출하고, 직접 Repository를 호출하지 않습니다.
     */
    private final InsuranceProductService insuranceProductService;

    /***
     * 보험 상품 등록
     * 
     * @param request 클라이언트가 보낸 JSON 데이터 (자동으로 DTO로 변환)
     * @return 201 Created + 등록된 상품 정보
     */
    @PostMapping
    public ResponseEntity<InsuranceProductResponse> create(
        @RequestBody InsuranceProductRequest request
    ) {
        // @RequestBody : JSON -> Java 객체로 자동 변환 
        InsuranceProductResponse response = insuranceProductService.create(request);
        
        // 201 Created 상태코드와 함께 결과 반환
        return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(response);
    }

    /**
     * 전체 조회
     *
     * @return 200 OK + 상품 목록
     */
    @GetMapping
    public ResponseEntity<List<InsuranceProductResponse>> findAll() {
        List<InsuranceProductResponse> responses = insuranceProductService.findAll();
        return ResponseEntity.ok(responses); // 200 OK 상태코드와 함께 결과 반환
    }

    /**
     * 단건 조회
     *
     * @param id 경로 변수로 받은 상품 ID
     * @return 200 OK + 상품 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<InsuranceProductResponse> findById(
        @PathVariable Long id
    ) {
        // @PathVariable : URL 경로에 있는 {id} 값을 메서드 파라미터로 받음
        InsuranceProductResponse response = insuranceProductService.findById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 보험 상품 수정
     *
     * @param id      수정할 상품 ID
     * @param request 수정할 내용
     * @return 200 OK + 수정된 상품 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<InsuranceProductResponse> update(
        @PathVariable Long id,
        @RequestBody InsuranceProductRequest request
    ) {
        InsuranceProductResponse response = insuranceProductService.update(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 보험 상품 삭제
     *
     * @param id 삭제할 상품 ID
     * @return 204 No Content (본문 없이 성공만 알림)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        insuranceProductService.delete(id); // Service를 통해 삭제 수행
        // 삭제 성공 시 204 No Content 상태코드 반환
        return ResponseEntity.noContent().build();
    }
}
