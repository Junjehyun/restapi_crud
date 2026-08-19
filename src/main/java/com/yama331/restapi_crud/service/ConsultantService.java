package com.yama331.restapi_crud.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.yama331.restapi_crud.dto.ConsultantRequest;
import com.yama331.restapi_crud.dto.ConsultantResponse;
import com.yama331.restapi_crud.entity.Consultant;
import com.yama331.restapi_crud.repository.ConsultantRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * 필요한 메서드
 * create
 * findAll
 * findById
 * update
 * delete
 * 
 * ConsultantService
 */
@Service // 서비스는 요리사다. 이건 요리사 명찰을 의미함.
@RequiredArgsConstructor
@Transactional // 메서드 안의 데이터베이스의 일을 한 묶음으로 본다. 중간에 예외가 나면 롤백.
public class ConsultantService {

    // 레파지토리 주입
    private final ConsultantRepository consultantRepository;
    
    /**
     * 설계사 등록
     * 
     * 흐름:
     * 1) Request DTO의 값으로 Entity 만들기
     * 2) repository.save -> INSERT
     * 3) 저장된 Entity를 Response로 바꿔 전환
     * 
     */
    public ConsultantResponse create(ConsultantRequest request) {
        // 1. Request -> Entity
        // id, createdAt, updatedAt은 여기서 안넣음 (DB/JPA가 채움)
        Consultant consultant = Consultant.builder()
        .name(request.getName())
        .employeeCode(request.getEmployeeCode())
        .phone(request.getPhone())
        .email(request.getEmail())
        .hireDate(request.getHireDate())
        .status(request.getStatus() != null ? request.getStatus() : "재직")
        .build();

        // 2. DB저장 (INSERT). 저장 후 saved에는 데이터베이스가 준 id가 들어있음
        Consultant saved = consultantRepository.save(consultant);
        // 3. Entity -> Response
        return ConsultantResponse.from(saved);
    }

    /**
     * 전체 목록
     * 
     * stream.map(..).collect(...) 뜻:
     * - 리스트의 각 엔티티를 Response로 변환해서
     * - 다시 List로 모은다.
     */
    public List<ConsultantResponse> findAll() {
        return consultantRepository.findAll()
        .stream()
        .map(ConsultantResponse::from)
        .collect(Collectors.toList());
    }

    /**
     * 단건 조회
     * 
     * findById는 Optional을 반환 (값이 있을 수도, 없을 수도 있는 상자)
     * - 있으면 Entity꺼냄
     * - 없으면 orElseThrow로 예외
     * 
     * 학습 단계에서는 IllegalArgumentException 사용
     * (나중에 @ControllerAdvice로 404 Json을 예쁘게 만들 수 있음.)
     */
    public ConsultantResponse findById(Long id) {
        Consultant consultant = consultantRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "해당 직원이 없습니다. id" + id
            ));
        return ConsultantResponse.from(consultant);    
    }

    /**
     * 직원 수정
     * 
     * 흐름:
     * 1) id로 기존 행 찾기 (없으면 예외)
     * 2) Request 값으로 필드 덮어쓰기
     * 3) 더티 체킹으로 UPDATE(별도 save 생략 가능)
     * 4) Response 반환
     */
    public ConsultantResponse update(Long id, ConsultantRequest request) {
        Consultant consultant = consultantRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "해당 직원이 없습니다. " + id
            ));
        
        consultant.setName(request.getName());
        consultant.setEmail(request.getEmail());
        consultant.setEmployeeCode(request.getEmployeeCode());
        consultant.setPhone(request.getPhone());
        consultant.setHireDate(request.getHireDate());
        // status는 요청이 있을 때만 변경 (null이면 기존 유지)
        if(request.getStatus() != null) {
            consultant.setStatus(request.getStatus());
        }

        return ConsultantResponse.from(consultant);
    }
    /**
     * 고객 삭제
     * 
     * 없는 id를 지우라고 하면 예외
     * 있으면 deleteById
     */
    public void delete(Long id) {
        if(!consultantRepository.existsById(id)) {
            throw new IllegalArgumentException(
                "해당 고객이 없습니다. id=" + id 
            );
        }
        consultantRepository.deleteById(id);
    }

}
