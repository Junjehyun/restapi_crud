package com.yama331.restapi_crud.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

/**
 * 고객(Customer) Entity
 *
 * [Entity란?]
 * - DB 테이블 1개와 짝이 되는 Java 클래스
 * - Laravel 의 Model 과 비슷한 자리
 * - 필드 하나 ≈ 컬럼 하나
 *
 * [JPA + ddl-auto=update]
 * - 앱 실행 시 이 클래스를 보고 customers 테이블을 만들거나 맞춤
 * - 그래서 지금은 SQL 로 CREATE TABLE 을 손으로 안 써도 됨
 *
 * [보험상품과 비교]
 * - InsuranceProduct → 상품 1건
 * - Customer         → 고객 1명
 * - 구조(어노테이션 패턴)는 거의 같고, 필드 내용만 다름
 */

@Entity // 이 클래스는 JPA Entity다.
@Table(name="customers") // 실제 테이블 이름 
@lombok.Getter
@lombok.Setter
@NoArgsConstructor// 기본 생성자 - JPA가 객체를 만들 때 필요
@AllArgsConstructor // 모든 필드 생성자
@Builder // Customer.builder().name("...").build() 형태로 생성 가능
public class Customer {
    /**
     * 기본키
     * GenerationType.IDENTITY = MySQL AUTO_INCREMENT 와 같은 방식
     * 우리가 id 를 안 넣어도 DB 가 1, 2, 3... 을 붙여 줌
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 고객 이름 (필수)
     * length = 50 → VARCHAR(50)
     * nullable = false → NOT NULL
     */
    @Column(nullable = false, length = 50)
    private String name;

    /**
     * 이메일 (필수)
     * 학습 단계에서는 unique 제약까지는 안 건다 (나중에 가능)
     */
    @Column(nullable = false, length = 100)
    private String email;

    /**
     * 연락처 (필수)
     * 예: "010-1234-5678"
     * 하이픈 포함 문자열로 단순 저장 (숫자 타입 아님)
     */
    @Column(nullable = false, length = 20)
    private String phone;

    /**
     * 생년월일 (선택)
     *
     * [왜 LocalDate?]
     * - 시각(시분초)이 필요 없고 "날짜만" 필요하면 LocalDate
     * - LocalDateTime 은 시분초까지 (createdAt 용)
     *
     * [DB 매핑]
     * - Java: birthDate (camelCase)
     * - DB  : birth_date (snake_case)
     * - name = "birth_date" 로 둘을 연결
     *
     * nullable 을 안 적으면 기본 true → NULL 허용 (생년월일 모르는 고객 가능)
     */
    @Column(name = "birth_date")
    private LocalDate birthDate;

    /**
     * 주소 (선택)
     */
    @Column(length = 200)
    private String address;

    /**
     * 고객 상태
     * 예: "활성", "비활성"
     * 기본값 "활성" — 등록 시 status 를 안 보내도 활성으로 저장
     */
    @Column(nullable = false, length = 10)
    @Builder.Default // builder로 만들 때도 기본값 적용
    private String status = "활성";

    /**
     * 생성 시각 — 처음 저장될 때만 자동 입력
     * updatable = false → 수정해도 created_at 은 안 바뀜
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정 시각 — 저장/수정될 때마다 자동 갱신
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
