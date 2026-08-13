package com.yama331.restapi_crud.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.yama331.restapi_crud.entity.Customer;
/**
 * 고객 Repository
 *
 * [Repository란?]
 * - "DB 에 저장 / 조회 / 삭제 해 줘" 를 부탁하는 계층
 * - Laravel Model 의 User::find(), ->save() 같은 역할을
 *   Spring 에서는 Repository 가 많이 맡음
 *
 * [JpaRepository 의 두 타입 파라미터]
 * - 첫 번째: 다루는 Entity → Customer
 * - 두 번째: 기본키 타입 → id 가 Long 이므로 Long
 *
 * [자동으로 생기는 메서드 예시]
 * - save(entity)      : INSERT 또는 UPDATE
 * - findById(id)      : 단건 조회 (Optional)
 * - findAll()         : 전체 목록
 * - deleteById(id)    : 삭제
 * - existsById(id)    : 존재 여부
 *
 * 우리는 인터페이스만 선언하면 되고,
 * 구현 클래스는 Spring Data JPA 가 실행 시 만들어 준다.
 * → "빈 인터페이스인데 왜 동작하지?" 가 정상이다.
 */
public interface CustomerRepository extends JpaRepository<Customer, Long>{
    // 지금은 기본 CRUD 만으로 충분.
    // 나중에 "이메일로 찾기" 등이 필요하면 여기에 메서드 이름만 추가하면 된다.
}
