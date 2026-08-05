package com.yama331.restapi_crud.entity;

import java.math.BigDecimal;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
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
 * 보험 상품을 나타내는 Entity 클래스
 *
 * [Entity란?]
 * - DB의 테이블과 1:1로 매핑되는 Java 클래스
 * - Laravel의 Model, Django의 Model과 비슷한 역할
 * - 이 클래스에 정의된 필드가 곧 DB 테이블의 컬럼이 됨
 *
 * [JPA가 하는 일]
 * - 애플리케이션 실행 시 이 클래스를 읽어서
 *   insurance_products 테이블을 자동으로 생성하거나 수정함.
 *   (application.properties의 ddl-auto=update 설정 덕분)
 */

@Entity // 이 클래스가 JPA Entity임을 선언
@Table(name = "insurance_products") // 이 Entity가 매핑될 테이블 이름 지정
@lombok.Getter // lombok 라이브러리의 Getter 어노테이션을 사용
@lombok.Setter // lombok 라이브러리의 Setter 어노테이션을 사용
@NoArgsConstructor // 기본생성자 자동생성 (JPA 필수)
@AllArgsConstructor // 모든 필드를 받는 생성자 자동 생성
@Builder // 빌더 패턴으로 객체 생성 가능
public class InsuranceProduct {

    /**
     * 기본키 ID
     * GenerationType.IDENTITY 전략을 사용하면 DB가 자동으로 증가시키는 값을 사용 = MySQL의 AUTO_INCREMENT와 동일
     */
    @Id // 이 필드가 테이블의 기본키임을 선언
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본키 생성 전략을 IDENTITY로 설정
    private Long id;

    /**
     * 상품명
     * nullable = false → NOT NULL
     * length = 100 → VARCHAR(100)
     */
    @Column(nullable = false, length = 100) // 이 필드가 테이블의 컬럼임을 선언, null 불가, 길이 제한 100
    private String name;

    /**
     * 보험사
     * 예: 삼성생명, 한화손해보험 등
     */
    @Column(nullable = false, length = 50) // 이 필드가 테이블의 컬럼임을 선언, null 불가, 길이 제한 50
    private String company;

    /**
     * 상품 유형
     * 예: 종신, 실손, 자동차, 연금 등
     */
    @Column(nullable = false, length = 30) // 이 필드가 테이블의 컬럼임을 선언, null 불가, 길이 제한 30
    private String type;

    /**
     * 월 보험료 (원 단위)
     *
     * [왜 BigDecimal을 쓰나?]
     * - float나 double은 소수점 계산에서 오차가 발생할 수 있음.
     * - 돈은 오차가 생기면 안 되기 때문에 BigDecimal을 사용함.
     *
     * [컬럼 매핑]
     * - Java 필드명: monthlyPremium (camelCase)
     * - DB 컬럼명  : monthly_premium (snake_case)
     * - name 속성으로 두 이름을 연결해 줌.
     *
     * precision = 10 → 전체 자릿수 10자리
     * scale = 0      → 소수점 이하 0자리 (정수로만 저장)
     */
    @Column(name = "monthly_premium", nullable = false, precision = 10, scale = 0)
    private BigDecimal monthlyPremium;

    /**
     * 상품 설명
     * 
     * - columnDefinition = "TEXT" → MySQL의 TEXT 타입 사용
     * - nullable을 따로 안 적으면 기본값이 true (NULL 허용)
     * - 설명이 없는 상품도 있을 수 있어서 NULL을 허용.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 판매 상태
     *
     * - 기본값을 "판매중"으로 설정
     * - 객체를 생성할 때 status를 안 넣으면 자동으로 "판매중"이 들어갑니다.
     * - 예: "판매중", "판매중지", "준비중"
     */
    @Column(nullable = false, length = 10)
    @Builder.Default // 빌더 패턴으로 객체 생성 시 기본값을 설정
    private String status = "판매중";

    /**
     * 생성 시간
     *
     * @CreationTimestamp
     * - 처음 데이터베이스에 저장될 때 현재 시간을 자동으로 넣어줍니다.
     * - 개발자가 직접 시간을 넣을 필요가 없습니다.
     *
     * updatable = false
     * - 한 번 저장된 후에는 이 값이 절대 변경되지 않습니다.
     * - (수정 시에도 created_at은 그대로 유지)
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;


    /**
     * 수정 시간
     *
     * @UpdateTimestamp
     * - 데이터가 저장되거나 수정될 때마다
     *   현재 시간으로 자동 갱신됩니다.
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
