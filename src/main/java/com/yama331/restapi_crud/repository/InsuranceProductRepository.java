package com.yama331.restapi_crud.repository;

import com.yama331.restapi_crud.entity.InsuranceProduct;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 보험 상품 Repository
 *
 * [Repository란?]
 * - 데이터베이스에 접근하는 역할을 하는 계층입니다.
 * - Laravel의 Model이 가지고 있는 조회/저장/삭제 기능을
 *   Spring에서는 이 Repository가 담당합니다.
 *
 * [JpaRepository를 상속하는 이유]
 * - JpaRepository<엔티티타입, 기본키타입>을 상속하면
 *   기본적인 CRUD 메서드를 자동으로 사용할 수 있습니다.
 *
 * 자동으로 제공되는 주요 메서드 예시:
 * - save()        : 저장 / 수정
 * - findById()    : id로 한 건 조회
 * - findAll()     : 전체 조회
 * - deleteById()  : id로 삭제
 * - count()       : 전체 개수 조회
 *
 * 우리는 인터페이스만 만들면 되고,
 * 실제 구현 코드는 Spring Data JPA가 실행 시점에 자동으로 만들어 줍니다. JpaRepository를 상속받으면 기본적인 CRUD 메서드가 자동으로 제공됨
 * 추가적인 쿼리 메서드를 정의할 수도 있음
 * 지금은 기본 메서드만으로 충분.
 */
public interface InsuranceProductRepository extends JpaRepository<InsuranceProduct, Long> {
    // JpaRepository를 상속받으면 기본적인 CRUD 메서드가 자동으로 제공됨
    // 추가적인 쿼리 메서드를 정의할 수도 있음
    // 지금은 기본 메서드만으로 충분.
    // 나중에 "보험사로 검색", "판매중만 조회" 같은
    // 커스텀 메서드가 필요하면 여기에 추가하면 됩니다.
    
}
