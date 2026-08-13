package com.yama331.restapi_crud.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.yama331.restapi_crud.dto.CustomerRequest;
import com.yama331.restapi_crud.dto.CustomerResponse;
import com.yama331.restapi_crud.entity.Customer;
import com.yama331.restapi_crud.repository.CustomerRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * 고객 Service
 *
 * [역할]
 * - 등록/조회/수정/삭제 "실제 일" 을 여기서 처리
 * - Controller 는 이 클래스만 호출하면 됨 (Repository 직접 호출 X)
 *
 * [@Service]
 * - Spring 이 이 클래스를 빈(Bean) 으로 등록 → 다른 곳에서 주입 가능
 *
 * [@RequiredArgsConstructor]
 * - final 필드용 생성자 자동 생성 → 생성자 주입
 *
 * [@Transactional]
 * - 메서드 단위로 DB 작업을 묶음
 * - 중간에 예외 나면 롤백 (일부만 저장되는 사고 방지)
 * - 수정 시 더티 체킹에도 도움
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    /**
     * Repository 주입
     * final + RequiredArgsConstructor = 생성자로 주입 (권장 방식)
     */
    private final CustomerRepository customerRepository;

    /**
     * 고객 등록
     *
     * 흐름:
     * 1) Request DTO 의 값으로 Entity 만들기
     * 2) repository.save → INSERT
     * 3) 저장된 Entity 를 Response 로 바꿔 반환
     */
    public CustomerResponse create(CustomerRequest request) {
        // 1. Request -> Entity
        // id, createdAt, updatedAt은 여기서 안넣음. (DB/JPA가 채움)
        Customer customer = Customer.builder()
        .name(request.getName())
        .email(request.getEmail())
        .phone(request.getPhone())
        .birthDate(request.getBirthDate())
        .address(request.getAddress())
        // status가 null이면 기본 '활성'
        .status(request.getStatus() != null ? request.getStatus() : "활성")
        .build();

        // 2. DB 저장 (INSERT). 저장 후 saved 에는 DB 가 준 id 가 들어 있음
        Customer saved = customerRepository.save(customer);
        // 3. Entity → Response
        return CustomerResponse.from(saved);
    }

    /**
     * 전체 목록
     *
     * stream().map(...).collect(...) 뜻:
     * - 리스트의 각 Entity 를 Response 로 변환해서
     * - 다시 List 로 모은다
     *
     * 보험상품 Service 의 findAll 과 동일한 패턴
     */
    public List<CustomerResponse> findAll() {
        return customerRepository.findAll()
        .stream()
        .map(CustomerResponse::from) // 메서드 참조 = c -> CustomerResponse.from(c)
        .collect(Collectors.toList());
    }

    /**
     * 단건 조회
     *
     * findById 는 Optional 을 반환 (값이 있을 수도, 없을 수도 있는 상자)
     * - 있으면 Entity 꺼냄
     * - 없으면 orElseThrow 로 예외
     *
     * 학습 단계에서는 IllegalArgumentException 사용
     * (나중에 @ControllerAdvice 로 404 JSON 을 예쁘게 만들 수 있음)
     */
    public CustomerResponse findById(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "해당 고객이 없습니다. id=" + id
            ));
        return CustomerResponse.from(customer);
    }

    /**
     * 고객 수정
     *
     * 흐름:
     * 1) id 로 기존 행 찾기 (없으면 예외)
     * 2) Request 값으로 필드 덮어쓰기
     * 3) 더티 체킹으로 UPDATE (별도 save 생략 가능)
     * 4) Response 반환
     */
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "해당 고객이 없습니다. id=" + id
            ));

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setBirthDate(request.getBirthDate());
        customer.setAddress(request.getAddress());
        // status는 요청에 있을 때만 변경 (null이면 기존 유지)
        if (request.getStatus() != null) {
            customer.setStatus(request.getStatus());
        }

        return CustomerResponse.from(customer);
    }
    /**
     * 고객 삭제
     *
     * 없는 id 를 지우라고 하면 예외
     * 있으면 deleteById
     */
    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new IllegalArgumentException(
                "해당 고객이 없습니다. id=" + id
            );
        }
        customerRepository.deleteById(id);
    }
}
