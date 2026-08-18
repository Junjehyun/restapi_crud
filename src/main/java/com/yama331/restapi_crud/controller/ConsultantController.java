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

import com.yama331.restapi_crud.dto.ConsultantRequest;
import com.yama331.restapi_crud.dto.ConsultantResponse;
import com.yama331.restapi_crud.service.ConsultantService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/consultants")
@RequiredArgsConstructor
public class ConsultantController {

    // 서비스 취득 
    private final ConsultantService consultantService;

    /**
     * 설계사 등록 create
     * 
     * @param request JSON body -> ConsultantRequest
     * @return 201 Created + 지정된 설계사 JSON
     * 
     */
    @PostMapping
    public ResponseEntity<ConsultantResponse> create (
        @RequestBody ConsultantRequest request
    ) {
        // JSON -> DTO 변환은 Spring이 해줌. (@RequestBody)
        ConsultantResponse response = consultantService.create(request);

        // 201 = 새로 만들었다는 의미의 성공 코드
        // 200을 써도 동작은 하지만 REST관례상 생성은 201 권장
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    /**
     * 전체 목록
     * @return 200 OK + 배열 JSON
     */
    @GetMapping
    public ResponseEntity<List<ConsultantResponse>> findAll() {
        return ResponseEntity.ok(consultantService.findAll());
    }

    /**
     * 단건 조회
     * URL 예: /api/consultant/3/ -> id = 3
     */
    @GetMapping("/{id}")
    public ResponseEntity<ConsultantResponse> findById(
        @PathVariable Long id
    ) {
        // @PathVariable: 경로 {id}를 변수로 받음
        return ResponseEntity.ok(consultantService.findById(id));
    }

    /**
     * 수정
     * URL의 id = 누구를 고칠지
     * Body의 JSON = 무엇으로 고칠지
     */
    @PutMapping("/{id}")
    public ResponseEntity<ConsultantResponse> update(
        @PathVariable Long id,
        @RequestBody ConsultantRequest request
    ) {
        return ResponseEntity.ok(consultantService.update(id, request));
    }

    /**
     * 삭제
     * 성공시 204 No Content = "성공했지만 body는 없음"
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        consultantService.delete(id);
        return ResponseEntity.noContent().build();
    }



}
