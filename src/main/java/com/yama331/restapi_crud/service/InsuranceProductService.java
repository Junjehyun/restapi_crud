package com.yama331.restapi_crud.service;

import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.yama331.restapi_crud.dto.InsuranceProductRequest;
import com.yama331.restapi_crud.dto.InsuranceProductResponse;
import com.yama331.restapi_crud.entity.InsuranceProduct;
import com.yama331.restapi_crud.repository.InsuranceProductRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;

/**
 * 보험 상품 Service
 *
 * [역할]
 * - 비즈니스 로직을 처리하는 계층입니다.
 * - Controller는 요청/응답만 담당하고,
 *   실제 저장·조회·수정·삭제 로직은 이 클래스가 담당합니다.
 *
 * [왜 필요한가?]
 * - Controller가 비대해지는 것을 방지합니다.
 * - 나중에 복잡한 로직(검증, 계산, 여러 테이블 처리 등)이 생겨도
 *   Service에만 추가하면 됩니다.
 */
@Service
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 만들어줌. (의존성 주입)
@Transactional // 메서드 실행 시 트랜잭션을 시작하고, 예외 발생 시 롤백 -> 성능 최적화
public class InsuranceProductService {
    
    private final InsuranceProductRepository insuranceProductRepository;

    /**
     * 보험 상품 등록
     *
     * @param request 클라이언트가 보낸 등록 데이터 (DTO)
     * @return 저장된 상품 정보 (Response DTO)
     */
    public InsuranceProductResponse create(InsuranceProductRequest request) {
        // 1. Request DTO -> Entity 변환
        // 클라이언트가 보낸 데이터를 DB에 저장할 수 있는 형태(Entity)로 변환.
        InsuranceProduct product = InsuranceProduct.builder()
        .name(request.getName())
        .company(request.getCompany())
        .type(request.getType())
        .monthlyPremium(request.getMonthlyPremium())
        .description(request.getDescription())
        // status를 보내지 않았을 경우 기본값 "판매중"을 넣어줌.
        .status(request.getStatus() != null ? request.getStatus() : "판매중")
        .build();

        // 2. Repository를 통해 DB에 저장
        //    save() 메서드는 새로운 데이터면 INSERT, 기존 데이터면 UPDATE를 수행.
        InsuranceProduct saved = insuranceProductRepository.save(product);

        // 3. 저장된 Entity를 Response DTO로 변환해서 반환
        //    클라이언트에게 Entity를 그대로 노출하지 않기 위해 DTO로 변환.
        return InsuranceProductResponse.from(saved);
    }

    /**
     * 전체 보험 상품 조회
     *
     * @return 모든 상품 목록 (Response DTO 리스트)
     */
    public List<InsuranceProductResponse> findAll() {
        // 1. DB에서 모든 상품을 가져옴 (Entity 리스트)
        // 2. 각 Entity를 Response DTO로 변환
        // 3. List로 모아서 반환
        return insuranceProductRepository.findAll()
        .stream() // 리스트를 스트림으로 변환 
        .map(InsuranceProductResponse::from) // 각 Entity를 Response로 변환
        .collect(Collectors.toList()); // 다시 List로 수집 
    }

    /**
     * 보험 상품 단건 조회
     *
     * @param id 조회할 상품의 기본키
     * @return 해당 상품 정보 (Response DTO)
     */
    public InsuranceProductResponse findById(Long id) {
        // findById는 Optional을 반환합니다.
        // 데이터가 있으면 Entity를 꺼내고,
        // 없으면 예외를 발생시킵니다.
        InsuranceProduct product = insuranceProductRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "해당 보험 상품이 없습니다. id=" + id
        ));
        // Entity -> Response DTO 변환 후 반환
        return InsuranceProductResponse.from(product);
    }

    /**
     * 보험 상품 수정
     *
     * @param id      수정할 상품의 기본키
     * @param request 수정할 내용 (DTO)
     * @return 수정된 상품 정보 (Response DTO)
     */
    public InsuranceProductResponse update(Long id, InsuranceProductRequest request) {

        // 1. 기존 데이터 조회 (없으면 예외 발생)
        InsuranceProduct product = insuranceProductRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "해당 보험 상품이 없습니다. id=" + id
        ));

        // 2. 값 변경
        // JPA의 "더티 체킹(Dirty Checking)" 기능 덕분에 
        // 값을 바꾸기만 하면 트랜잭션이 끝날 떄 자동으로 업데이트
        // 따로 save()를 호출할 필요가 없다.
        product.setName(request.getName());
        product.setCompany(request.getCompany());
        product.setType(request.getType());
        product.setMonthlyPremium(request.getMonthlyPremium());
        product.setDescription(request.getDescription());

        // status는 요청에 값이 있을 때만 변경 
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        // 3. 변경된 엔티티를 Response DTO로 변환 후 반환
        return InsuranceProductResponse.from(product);
    }

    /**
     * 보험 상품 삭제
     *
     * @param id 삭제할 상품의 기본키
     */
    public void delete(Long id) {
        // 삭제하기 전에 해당 id의 데이터가 존재하는지 확인
        if(!insuranceProductRepository.existsById(id)) {
            throw new IllegalArgumentException(
                "해당 보험 상품이 없습니다. id=" + id
            );
        }
        // 존재하면 삭제
        insuranceProductRepository.deleteById(id);
    }
}
