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

@Entity // 이 클래스는 JPA가 관리하는 테이블의 짝이다.
@Table(name="consultants") // 실제 테이블 이름. 자바 클래스 이름과 다를 수 있어서 명시하는 거임.
@lombok.Getter // 
@lombok.Setter // Setter가 없으면 수정이 불가능.
@NoArgsConstructor // 인자가 없는 생성자 JPA필수, 
@AllArgsConstructor // 모든 필드를 한번에 받는 생성자.ㄴ
@Builder // Consultant.builder().name("...").build() 형태로 생성 가능 , 레고처럼 필요한 칸만 골라 조립. create가 이 방식으로 엔티티를 만든다. id와 crated_at등은 조립에 안넣는다. DB가채운다.
public class Consultant {

    @Id // 이 필드가 기본키 라는것.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "employee_code", nullable = false, length = 20)
    private String employeeCode;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(nullable = false, length = 20)
    private String status = "재직";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
