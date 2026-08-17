# 고객(Customer) CRUD 작업 매뉴얼  
## 백엔드 → 프론트엔드 한 바퀴 (따라 하기)

| 항목 | 내용 |
|------|------|
| 대상 | 보험상품 CRUD를 **이미 한 번** 해본 사람 |
| 목표 | **고객** 도메인으로 Entity부터 화면까지 같은 패턴 재연습 |
| 상태 | **끝 · 참고용.** 지금 본문은 `06_CONSULTANT_CRUD_MISSION.md` |
| 관련 | `00_README.md` · 상품 참고 `04_PRODUCT_CRUD_MANUAL.md` |
| 원칙 | **위에서 아래 순서**. 각 Work **확인** 통과 후 다음으로 |

---

## 이 매뉴얼 쓰는 법

1. **복사만 하지 말고**, 보험상품 파일과 **나란히 열어 놓고** “이름만 바뀌었구나”를 확인한다.  
2. 예시 코드의 **주석까지 읽는다.** 주석이 수업이다.  
3. 프론트는 **Postman 통과 후**에만 시작한다. (문제 원인을 절반으로 줄임)  
4. 로그인·계약·검색 등은 **넣지 않는다.**  
5. 막히면 맨 아래 **부록: 문제 해결** 을 본다.

### 끝났다고 말하는 기준

- [ ] Postman: 고객 POST / GET 목록 / GET 단건 / PUT / DELETE 모두 성공  
- [ ] 브라우저 `/customers` 에서 목록 보임  
- [ ] 고객 등록 → 목록에 새 행  
- [ ] 수정 → 값 변경  
- [ ] 삭제 → 행 사라짐  
- [ ] 기존 상품 CRUD(`/`) 도 여전히 동작  

---

# 시작 전에 머릿속에 넣을 그림

## 0-A. 한 줄 비유

| 익숙한 것 (Laravel 등) | 이 프로젝트 |
|------------------------|-------------|
| Model | **Entity** (`Customer.java`) |
| Eloquent / DB 접근 | **Repository** |
| Form Request / Resource | **DTO** (Request / Response) |
| Service / 컨트롤러 안 로직 | **Service** |
| `routes/api.php` + Controller | **@RestController** |
| Blade / 뷰 | **React pages** |
| axios / fetch 로 API 호출 | **customerApi.ts** |

## 0-B. 요청 한 번이 흐르는 길 (등록 예시)

```
[브라우저 폼]  또는  [Postman]
      │
      │  POST http://localhost:8080/api/customers
      │  Body: { "name":"김민수", "email":"...", ... }
      ▼
CustomerController.create()
      │  @RequestBody → CustomerRequest 객체로 자동 변환
      ▼
CustomerService.create()
      │  Request → Entity 로 바꾸고
      │  repository.save(entity)
      ▼
CustomerRepository (JPA)
      │  INSERT INTO customers ...
      ▼
MySQL 테이블 customers
      │
      │  저장된 Entity 를 Response DTO 로 변환
      ▼
Controller 가 JSON + 201 로 응답
      │
      ▼
브라우저/Postman 이 id 가 붙은 고객 JSON 을 받음
```

**지금 안 외워도 된다.**  
파일을 만들 때마다 “아, 지금 이 층이구나” 하고 이 그림을 다시 보면 된다.

## 0-C. 보험상품과 짝 맞추기

작업 중 헷갈리면 이 표만 본다.

| 할 일 | 상품 쪽 (이미 있음) | 고객 쪽 (이번에 만듦) |
|-------|---------------------|------------------------|
| 테이블 모양 | `InsuranceProduct` | `Customer` |
| DB 접근 | `InsuranceProductRepository` | `CustomerRepository` |
| 요청 JSON | `InsuranceProductRequest` | `CustomerRequest` |
| 응답 JSON | `InsuranceProductResponse` | `CustomerResponse` |
| 로직 | `InsuranceProductService` | `CustomerService` |
| URL 입구 | `InsuranceProductController` | `CustomerController` |
| API 경로 | `/api/insurance-products` | `/api/customers` |
| 화면 경로 | `/`, `/products/...` | `/customers/...` |

---

# Work 0. 환경 준비 (10분)

## 0-1. MySQL

- MySQL 실행 중  
- DB 이름: `restapi_crud`  
- 계정/비번 = `src/main/resources/application.properties` 와 동일  

DB 없으면:

```sql
CREATE DATABASE restapi_crud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 0-2. 백엔드

프로젝트 **루트**에서:

```bash
./gradlew bootRun
```

**확인 (상품 API로 서버 생존 체크)**

- Postman: `GET http://localhost:8080/api/insurance-products`  
- Status 200 이면 서버·DB·CORS 이전 설정은 살아 있음  

## 0-3. 프론트 (나중 Work 에서 써도 됨)

```bash
cd frontend
npm install
npm run dev
```

브라우저: `http://localhost:5173` → 상품 목록이 보이면 OK.

## 0-4. 체크

| 확인 | 결과 |
|------|------|
| MySQL | ☐ |
| bootRun + 상품 GET 200 | ☐ |
| (선택) 프론트 5173 | ☐ |

→ **Work 1**

---

# Work 1. Entity + Repository (DB 층) (20~30분)

## 왜 먼저 Entity인가?

Entity = **“DB 테이블을 Java로 그린 설계도”**.  
이게 없으면 Repository도 Service도 의미가 없다.

보험상품 파일을 옆에 열어 두자:

`src/main/java/com/yama331/restapi_crud/entity/InsuranceProduct.java`

### 개념 미니 사전

| 단어 | 뜻 (초보용) |
|------|-------------|
| `@Entity` | “이 클래스는 DB 테이블과 연결된다” |
| `@Table(name=...)` | 실제 테이블 이름 |
| `@Id` + `@GeneratedValue` | 기본키, DB가 번호 자동 증가 |
| `@Column` | 컬럼 옵션 (길이, NULL 여부 등) |
| camelCase ↔ snake_case | Java `birthDate` ↔ DB `birth_date` (`name=` 로 연결) |
| Lombok `@Getter` 등 | getter/setter/생성자 코드 자동 생성 |

---

## 1-1. `Customer.java` 만들기

**경로**  
`src/main/java/com/yama331/restapi_crud/entity/Customer.java`

**새 파일**을 만들고 아래를 **그대로** 넣어도 된다. (주석 포함 권장)

```java
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
@Entity // "이 클래스는 JPA Entity 다"
@Table(name = "customers") // 실제 테이블 이름
@lombok.Getter
@lombok.Setter
@NoArgsConstructor  // 기본 생성자 — JPA 가 객체를 만들 때 필요
@AllArgsConstructor // 모든 필드 생성자
@Builder            // Customer.builder().name("...").build() 형태로 생성 가능
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
    @Builder.Default // builder 로 만들 때도 기본값 적용
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
```

### 확인

- [ ] 패키지 경로가 `entity` 아래  
- [ ] 파일명 = 클래스명 `Customer.java`  
- [ ] import 빨간 줄 없음 (IDE)  

---

## 1-2. `CustomerRepository.java` 만들기

**경로**  
`src/main/java/com/yama331/restapi_crud/repository/CustomerRepository.java`

```java
package com.yama331.restapi_crud.repository;

import com.yama331.restapi_crud.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

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
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // 지금은 기본 CRUD 만으로 충분.
    // 나중에 "이메일로 찾기" 등이 필요하면 여기에 메서드 이름만 추가하면 된다.
    // 예: Optional<Customer> findByEmail(String email);
}
```

### 확인

- [ ] `extends JpaRepository<Customer, Long>`  
- [ ] 컴파일 에러 없음  

→ **Work 2**

---

# Work 2. DTO (Request / Response) (15~20분)

## 왜 Entity를 그대로 API에 안 쓰나?

| 그대로 Entity 반환 | DTO 사용 |
|--------------------|----------|
| DB 구조가 밖으로 그대로 노출 | 밖으로 나갈 필드만 선택 가능 |
| 나중에 비밀번호 같은 민감 필드 위험 | 요청/응답 모양을 분리해서 안전 |
| 클라이언트 요구와 DB 가 섞임 | **입구(Request)** 와 **출구(Response)** 가 분명 |

초보 단계 규칙:

- **들어올 때** → `CustomerRequest`  
- **나갈 때** → `CustomerResponse`  
- **DB 저장 형태** → `Customer` Entity  

---

## 2-1. `CustomerRequest.java`

**경로**  
`src/main/java/com/yama331/restapi_crud/dto/CustomerRequest.java`

```java
package com.yama331.restapi_crud.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 고객 등록/수정 요청 DTO
 *
 * [역할]
 * - 클라이언트가 보낸 JSON 을 담는 그릇
 * - Controller 가 @RequestBody 로 이 클래스를 받음
 *
 * [예시 JSON]
 * {
 *   "name": "김민수",
 *   "email": "minsu@example.com",
 *   "phone": "010-1111-2222",
 *   "birthDate": "1990-05-15",
 *   "address": "서울시 강남구",
 *   "status": "활성"
 * }
 *
 * [날짜 팁]
 * - JSON 문자열 "1990-05-15" → Java LocalDate 로 자동 변환 (Spring 기본)
 * - 프론트 input type="date" 값 형식과 딱 맞음
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerRequest {

    /** 고객 이름 (필수) */
    private String name;

    /** 이메일 (필수) */
    private String email;

    /** 연락처 (필수) */
    private String phone;

    /**
     * 생년월일 (선택)
     * 안 보내면 null
     */
    private LocalDate birthDate;

    /** 주소 (선택) */
    private String address;

    /**
     * 상태 (선택)
     * 안 보내면 Service/Entity 에서 "활성" 기본값
     */
    private String status;
}
```

---

## 2-2. `CustomerResponse.java`

**경로**  
`src/main/java/com/yama331/restapi_crud/dto/CustomerResponse.java`

```java
package com.yama331.restapi_crud.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.yama331.restapi_crud.entity.Customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 고객 응답 DTO
 *
 * [역할]
 * - 서버가 클라이언트에게 돌려주는 JSON 모양
 * - Entity 를 그대로 주지 않고, 이 객체로 변환해서 줌
 *
 * [from 메서드]
 * - Entity → Response 변환을 한곳에 모아 둠
 * - Service 여러 곳에서 response = CustomerResponse.from(entity) 로 사용
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String address;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Entity → Response 변환
     *
     * @param customer DB 에서 읽었거나 방금 저장한 Entity
     * @return 클라이언트에 줄 DTO
     */
    public static CustomerResponse from(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .birthDate(customer.getBirthDate())
                .address(customer.getAddress())
                .status(customer.getStatus())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
```

### 확인

- [ ] Request 에 id / createdAt **없음** (클라이언트가 id 를 만들어 오면 안 됨)  
- [ ] Response 에 id / createdAt / updatedAt **있음**  
- [ ] `from()` 이 모든 필드를 채움  

→ **Work 3**

---

# Work 3. Service (비즈니스 로직) (25~40분)

## Service가 하는 일

Controller 는 “문지기”, Service 는 “일 하는 사람”.

```
Controller: HTTP 만 신경 씀 (상태 코드, JSON 입출력)
Service   : 저장 전 변환, 없을 때 예외, 필드 수정 등
Repository: DB 버튼 누르기
```

보험상품 `InsuranceProductService` 를 옆에 두고 **같은 5개 메서드**를 만들면 된다.

| 메서드 | 하는 일 |
|--------|---------|
| `create` | Request → Entity → save → Response |
| `findAll` | findAll → 각각 from → List |
| `findById` | findById 없으면 예외 → from |
| `update` | 조회 후 setter 로 값 변경 → from |
| `delete` | 존재 확인 후 deleteById |

### 더티 체킹 (수정 시 왜 save 를 안 부르나?)

1. `findById` 로 Entity 를 가져오면, 그 객체는 JPA 가 **지켜보는 중**  
2. `setName(...)` 등으로 값을 바꿈  
3. 메서드(트랜잭션)가 끝날 때 JPA 가 “바뀌었네?” 하고 **UPDATE SQL 자동 실행**  
4. 그래서 update 에서 `save()` 를 또 안 써도 되는 경우가 많음  

`@Transactional` 이 클래스에 있어야 이 흐름이 안정적이다.  
(상품 Service 와 동일 패턴)

---

## 3-1. `CustomerService.java`

**경로**  
`src/main/java/com/yama331/restapi_crud/service/CustomerService.java`

```java
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
        // 1. Request → Entity
        //    id, createdAt, updatedAt 은 여기서 안 넣음 (DB/JPA 가 채움)
        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .birthDate(request.getBirthDate()) // null 가능
                .address(request.getAddress())     // null 가능
                // status 가 null 이면 기본 "활성"
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

        // status 는 요청에 있을 때만 변경 (null 이면 기존 유지)
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
```

### 확인

- [ ] create / findAll / findById / update / delete 다섯 개  
- [ ] Repository 만 주입, Controller 는 아직 없음 OK  

→ **Work 4**

---

# Work 4. Controller (HTTP 입구) (20~30분)

## REST와 HTTP 메서드 (초보 핵심)

| 하고 싶은 일 | HTTP 메서드 | URL 예 | 성공 코드 |
|--------------|-------------|--------|-----------|
| 새로 만들기 | **POST** | `/api/customers` | **201** |
| 목록 보기 | **GET** | `/api/customers` | **200** |
| 한 명 보기 | **GET** | `/api/customers/1` | **200** |
| 고치기 | **PUT** | `/api/customers/1` | **200** |
| 지우기 | **DELETE** | `/api/customers/1` | **204** |

### 어노테이션 미니 사전

| 어노테이션 | 뜻 |
|------------|-----|
| `@RestController` | 이 클래스의 반환값 = JSON (뷰 이름 아님) |
| `@RequestMapping("/api/customers")` | 이 컨트롤러 URL 접두사 |
| `@PostMapping` | POST + 접두사 |
| `@GetMapping("/{id}")` | GET + 접두사 + id |
| `@RequestBody` | HTTP body JSON → Java 객체 |
| `@PathVariable` | URL 의 `{id}` → 메서드 인자 |
| `ResponseEntity` | 상태 코드 + body 를 같이 표현 |

---

## 4-1. `CustomerController.java`

**경로**  
`src/main/java/com/yama331/restapi_crud/controller/CustomerController.java`

```java
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

import com.yama331.restapi_crud.dto.CustomerRequest;
import com.yama331.restapi_crud.dto.CustomerResponse;
import com.yama331.restapi_crud.service.CustomerService;

import lombok.RequiredArgsConstructor;

/**
 * 고객 REST API Controller
 *
 * [역할]
 * - 브라우저/Postman 의 HTTP 요청을 받는 첫 관문
 * - Service 에 일을 시키고, 결과를 HTTP 응답으로 돌려줌
 *
 * [URL 설계]
 * POST   /api/customers      → 등록
 * GET    /api/customers      → 전체 조회
 * GET    /api/customers/{id} → 단건 조회
 * PUT    /api/customers/{id} → 수정
 * DELETE /api/customers/{id} → 삭제
 *
 * [계층 규칙]
 * Controller → Service 만 호출
 * Controller 가 Repository 를 직접 부르지 않음
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * 고객 등록
     *
     * @param request JSON body → CustomerRequest
     * @return 201 Created + 저장된 고객 JSON
     */
    @PostMapping
    public ResponseEntity<CustomerResponse> create(
            @RequestBody CustomerRequest request
    ) {
        // JSON → DTO 변환은 Spring 이 해 줌 (@RequestBody)
        CustomerResponse response = customerService.create(request);

        // 201 = "새로 만들었다" 는 의미의 성공 코드
        // 200 을 써도 동작은 하지만, REST 관례상 생성은 201 권장
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 전체 목록
     * @return 200 OK + 배열 JSON
     */
    @GetMapping
    public ResponseEntity<List<CustomerResponse>> findAll() {
        return ResponseEntity.ok(customerService.findAll());
    }

    /**
     * 단건 조회
     * URL 예: /api/customers/3  → id = 3
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> findById(
            @PathVariable Long id
    ) {
        // @PathVariable : 경로의 {id} 를 변수로 받음
        return ResponseEntity.ok(customerService.findById(id));
    }

    /**
     * 수정
     * URL 의 id = 누구를 고칠지
     * Body 의 JSON = 무엇으로 고칠지
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(
            @PathVariable Long id,
            @RequestBody CustomerRequest request
    ) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    /**
     * 삭제
     * 성공 시 204 No Content = "성공했지만 body 는 없음"
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 확인

- [ ] `@RequestMapping("/api/customers")`  
- [ ] 다섯 메서드 매핑 완료  
- [ ] **서버 재시작** (`bootRun` 다시)  

재시작 이유:

- 새 Java 클래스 반영  
- `ddl-auto=update` 가 `customers` 테이블 생성  

로그에 에러 없이 기동되면 **Work 5 (Postman)**.

---

# Work 5. Postman으로 백엔드 검증 (필수, 20분)

프론트를 만들기 **전에** API가 사는 지 확인한다.  
여기서 실패하면 프론트 코드 문제가 아니다.

공통:

- Base: `http://localhost:8080`  
- POST/PUT → Body 탭 → **raw** → **JSON**

---

### 5-1. 목록 (처음엔 빈 배열 가능)

| 항목 | 값 |
|------|-----|
| Method | **GET** |
| URL | `http://localhost:8080/api/customers` |
| Body | 없음 |

기대: **200**, `[]` 또는 `[{...}]`

---

### 5-2. 등록

| 항목 | 값 |
|------|-----|
| Method | **POST** |
| URL | `http://localhost:8080/api/customers` |

Body:

```json
{
  "name": "김민수",
  "email": "minsu@example.com",
  "phone": "010-1111-2222",
  "birthDate": "1990-05-15",
  "address": "서울시 강남구",
  "status": "활성"
}
```

기대:

- Status **201**  
- Body 에 `"id": 숫자`, `"name": "김민수"`  
- **id 를 메모** (아래 단계에서 사용)

---

### 5-3. 단건 조회

| 항목 | 값 |
|------|-----|
| Method | **GET** |
| URL | `http://localhost:8080/api/customers/1` ← 메모한 id |

기대: **200**, 해당 고객 1명

---

### 5-4. 수정

| 항목 | 값 |
|------|-----|
| Method | **PUT** |
| URL | `http://localhost:8080/api/customers/1` |

Body:

```json
{
  "name": "김민수",
  "email": "minsu.updated@example.com",
  "phone": "010-9999-8888",
  "birthDate": "1990-05-15",
  "address": "서울시 서초구",
  "status": "활성"
}
```

기대: **200**, email/phone/address 가 바뀐 JSON

---

### 5-5. 삭제

| 항목 | 값 |
|------|-----|
| Method | **DELETE** |
| URL | `http://localhost:8080/api/customers/1` |

기대: **204**, Body 비어 있음

다시 GET 목록 → 방금 id 가 없어야 함.  
(연습용으로 한 명 더 POST 해 두어도 좋다.)

---

### 5-6. 체크

| API | 확인 |
|-----|------|
| GET 목록 | ☐ |
| POST 등록 | ☐ |
| GET 단건 | ☐ |
| PUT 수정 | ☐ |
| DELETE 삭제 | ☐ |

**하나라도 실패하면 프론트 Work 로 가지 말 것.**  
백엔드 로그 · 테이블 존재 여부 · 포트 8080 을 먼저 본다.

→ 전부 통과 시 **Work 6 (프론트 시작)**

---

# Work 6. 프론트 타입 + API 함수 (20분)

## 왜 types 와 api 를 화면보다 먼저?

```
types/customer.ts   ← "데이터 모양" (DTO 와 맞춤)
api/customerApi.ts  ← "서버 호출 함수" (Controller URL 과 1:1)
pages/*.tsx         ← "화면" 이 위 둘을 사용
```

화면부터 만들면 “URL 오타 + 필드 오타 + UI 버그”가 한 번에 섞인다.  
**모양 → 호출 → 화면** 순서가 디버깅이 쉽다.

`frontend/src/api/axios.ts` 는 **건드리지 않는다.**  
이미 `baseURL: http://localhost:8080` 이다.

---

## 6-1. `frontend/src/types/customer.ts`

```ts
/**
 * 고객 관련 TypeScript 타입
 *
 * 백엔드 DTO 와 "필드 이름"을 맞춘다.
 * - Request  : 등록/수정 때 보내는 몸통
 * - Response : 서버가 돌려주는 몸통
 *
 * [Java ↔ TypeScript 대응]
 * - String          → string
 * - Long / 숫자     → number
 * - LocalDate       → string  ("YYYY-MM-DD")  ※ JSON 에서는 문자열
 * - LocalDateTime   → string  (ISO 날짜시간 문자열)
 * - null 가능 필드  → string | null 또는 선택 속성 ?
 */

/**
 * 등록/수정 요청 타입
 * = 백엔드 CustomerRequest
 */
export interface CustomerRequest {
  name: string;           // 필수: 이름
  email: string;          // 필수: 이메일
  phone: string;          // 필수: 연락처
  birthDate?: string;     // 선택: "1990-05-15" 형식. ? = 없어도 됨
  address?: string;       // 선택: 주소
  status?: string;        // 선택: 안 보내면 서버 기본값 "활성"
}

/**
 * 서버 응답 타입
 * = 백엔드 CustomerResponse
 */
export interface CustomerResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string | null; // 서버가 null 줄 수 있음
  address: string | null;
  status: string;
  createdAt: string; // LocalDateTime → JSON 문자열
  updatedAt: string;
}
```

---

## 6-2. `frontend/src/api/customerApi.ts`

```ts
// axios 인스턴스 (baseURL 이 이미 localhost:8080)
import api from './axios.ts';

// 요청/응답 타입
import type {
  CustomerRequest,
  CustomerResponse,
} from '../types/customer.ts';

/**
 * 고객 API 함수 모음
 *
 * 백엔드 CustomerController 와 1:1
 *
 * POST   /api/customers      → 등록
 * GET    /api/customers      → 전체
 * GET    /api/customers/{id} → 단건
 * PUT    /api/customers/{id} → 수정
 * DELETE /api/customers/{id} → 삭제
 *
 * [path 앞에 슬래시 / 필수]
 * - baseURL 이 http://localhost:8080 일 때
 * - '/api/customers' → http://localhost:8080/api/customers  (올바름)
 * - 'api/customers'  → 상대경로가 꼬일 수 있음 (상품 때 겪었던 실수)
 */

/** 전체 목록 GET */
export const getCustomers = async (): Promise<CustomerResponse[]> => {
  // api.get<응답타입>(경로)
  // response.data 가 실제 JSON 본문 (배열)
  const response = await api.get<CustomerResponse[]>('/api/customers');
  return response.data;
};

/** 단건 GET */
export const getCustomer = async (id: number): Promise<CustomerResponse> => {
  // 백틱 문자열로 id 삽입: /api/customers/3
  const response = await api.get<CustomerResponse>(`/api/customers/${id}`);
  return response.data;
};

/** 등록 POST */
export const createCustomer = async (
  data: CustomerRequest
): Promise<CustomerResponse> => {
  // 두 번째 인자 data = Request Body (JSON)
  const response = await api.post<CustomerResponse>('/api/customers', data);
  return response.data;
};

/** 수정 PUT */
export const updateCustomer = async (
  id: number,
  data: CustomerRequest
): Promise<CustomerResponse> => {
  const response = await api.put<CustomerResponse>(
    `/api/customers/${id}`,
    data
  );
  return response.data;
};

/** 삭제 DELETE — 본문 없음, 204 */
export const deleteCustomer = async (id: number): Promise<void> => {
  // 반환 body 가 없으므로 response.data 를 안 써도 됨
  await api.delete(`/api/customers/${id}`);
};
```

### 확인

- [ ] 모든 path 가 `'/api/customers...'` 로 시작 (앞 `/`)  
- [ ] export 함수 5개  

→ **Work 7**

---

# Work 7. 라우터 + 빈 페이지 뼈대 (20분)

## 왜 빈 페이지부터?

한 번에 폼+API+표까지 쓰면 에러 원인 추적이 어렵다.  
**URL → 화면이 뜨는지만** 먼저 확인한다. (상품 매뉴얼 Work 3 과 동일)

| URL | 나중에 될 화면 |
|-----|----------------|
| `/customers` | 목록 |
| `/customers/new` | 등록 |
| `/customers/:id/edit` | 수정 |

---

## 7-1. 빈 목록 페이지

**파일** `frontend/src/pages/CustomerList.tsx` (새 파일)

```tsx
// ============================================================
// 고객 목록 화면 — 지금은 "방만 만든" 상태
// Work 8 에서 진짜 표 + API 를 채운다
// ============================================================

function CustomerList() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>고객 목록 (준비 중)</h1>
      <p>Work 8 에서 API 연동 표를 만듭니다.</p>
      {/* 일반 a 태그 — 뼈대 단계에선 단순 링크도 OK */}
      <a href="/">상품 목록으로</a>
    </div>
  );
}

export default CustomerList;
```

---

## 7-2. 빈 등록 페이지

**파일** `frontend/src/pages/CustomerCreate.tsx`

```tsx
// 고객 등록 — 뼈대
function CustomerCreate() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>고객 등록 (준비 중)</h1>
      <p>Work 9 에서 폼을 만듭니다.</p>
      <a href="/customers">고객 목록으로</a>
    </div>
  );
}

export default CustomerCreate;
```

---

## 7-3. 빈 수정 페이지

**파일** `frontend/src/pages/CustomerEdit.tsx`

```tsx
// useParams = URL 의 :id 읽기
import { useParams } from 'react-router-dom';

function CustomerEdit() {
  // /customers/5/edit → id === "5" (문자열)
  const { id } = useParams();

  return (
    <div style={{ padding: '20px' }}>
      <h1>고객 수정 (준비 중)</h1>
      <p>고객 ID: {id}</p>
      <p>Work 10 에서 폼을 만듭니다.</p>
      <a href="/customers">고객 목록으로</a>
    </div>
  );
}

export default CustomerEdit;
```

---

## 7-4. `App.tsx` 에 Route 추가

파일: `frontend/src/App.tsx`

### (1) import 추가

기존 상품 import 아래에:

```tsx
import CustomerList from './pages/CustomerList.tsx';
import CustomerCreate from './pages/CustomerCreate.tsx';
import CustomerEdit from './pages/CustomerEdit.tsx';
```

### (2) `<Routes>` 안에 Route 추가 (기존 상품 Route **유지**)

```tsx
{/* ===== 고객 ===== */}
{/* 목록 */}
<Route path="/customers" element={<CustomerList />} />
{/* 등록 — "new" 를 :id 보다 위에 두는 편이 안전 (관례) */}
<Route path="/customers/new" element={<CustomerCreate />} />
{/* 수정 — :id 자리 표시자 */}
<Route path="/customers/:id/edit" element={<CustomerEdit />} />
```

**완성 예시 구조 (참고)**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import InsuranceProductList from './pages/InsuranceProductList.tsx';
import InsuranceProductCreate from './pages/InsuranceProductCreate.tsx';
import InsuranceProductEdit from './pages/InsuranceProductEdit.tsx';
import CustomerList from './pages/CustomerList.tsx';
import CustomerCreate from './pages/CustomerCreate.tsx';
import CustomerEdit from './pages/CustomerEdit.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 상품 (기존) */}
        <Route path="/" element={<InsuranceProductList />} />
        <Route path="/products/new" element={<InsuranceProductCreate />} />
        <Route path="/products/:id/edit" element={<InsuranceProductEdit />} />

        {/* 고객 (신규) */}
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/new" element={<CustomerCreate />} />
        <Route path="/customers/:id/edit" element={<CustomerEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 7-5. 확인

| URL | 기대 |
|-----|------|
| `http://localhost:5173/customers` | “고객 목록 (준비 중)” |
| `http://localhost:5173/customers/new` | “고객 등록 (준비 중)” |
| `http://localhost:5173/customers/1/edit` | “고객 수정”, ID: 1 |
| `http://localhost:5173/` | 기존 상품 목록 유지 |

- [ ] 네 URL 모두 OK  
- [ ] 콘솔에 Router 빨간 에러 없음  

→ **Work 8**

---

# Work 8. 고객 목록 + 삭제 (Read / Delete) (40분)

## 목표

- 페이지 진입 시 `GET /api/customers`  
- 표로 표시  
- 삭제 버튼 → 확인 → `DELETE` → 목록 다시 로드  
- 등록/수정 링크, 상품 목록 링크

## 한 줄 흐름

```
화면 마운트 → useEffect → getCustomers() → setCustomers
삭제 클릭 → confirm → deleteCustomer(id) → getCustomers() 다시
```

---

## 8-1. `CustomerList.tsx` 전체 교체

```tsx
// ============================================================
// 고객 목록 화면
// 흐름:
//   1) 들어오면 GET /api/customers
//   2) 표로 그림
//   3) 삭제 시 DELETE 후 목록 재조회
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// API 함수
import {
  getCustomers,    // GET 목록
  deleteCustomer,  // DELETE 한 건
} from '../api/customerApi.ts';

// 응답 한 건의 타입
import type { CustomerResponse } from '../types/customer.ts';

function CustomerList() {
  // ---------- state (화면이 기억하는 값) ----------
  // 고객 배열. 처음엔 빈 배열
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  // true 면 "로딩 중..." 화면
  const [loading, setLoading] = useState<boolean>(true);
  // null 이면 에러 없음. 문자열이면 빨간 메시지
  const [error, setError] = useState<string | null>(null);

  // ---------- 서버에서 목록 가져오기 ----------
  // 처음 입장 + 삭제 성공 후 재사용
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      // await = 응답 올 때까지 잠깐 대기
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err); // F12 Console 에 상세
      setError('고객 목록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      // 성공/실패 상관없이 로딩 종료
      setLoading(false);
    }
  };

  // 화면이 처음 나타날 때 1회 실행 ([] = 의존값 없음)
  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---------- 삭제 ----------
  const handleDelete = async (id: number, customerName: string) => {
    // 브라우저 기본 확인창. 취소면 false
    const ok = window.confirm(`"${customerName}" 고객을 삭제할까요?`);
    if (!ok) return;

    try {
      await deleteCustomer(id);
      // DB 와 화면을 맞추기 위해 다시 목록 로드
      await fetchCustomers();
    } catch (err) {
      console.error(err);
      setError('삭제에 실패했습니다.');
    }
  };

  // ---------- 로딩 / 에러 전용 화면 ----------
  if (loading) {
    return <div style={{ padding: '20px' }}>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  // ---------- 정상 화면 ----------
  return (
    <div style={{ padding: '20px' }}>
      <h1>고객 목록</h1>

      <p>
        {/* SPA 이동: 전체 새로고침 없이 라우터만 바꿈 */}
        <Link to="/customers/new" style={{ marginRight: 12 }}>
          + 고객 등록
        </Link>
        <Link to="/">← 상품 목록</Link>
      </p>

      {customers.length === 0 ? (
        <p>등록된 고객이 없습니다.</p>
      ) : (
        <table
          border={1}
          cellPadding={8}
          style={{ borderCollapse: 'collapse', width: '100%' }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>연락처</th>
              <th>생년월일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {/*
              map = 배열 각 요소를 <tr> 로 변환
              key={customer.id} = React 가 행을 구분하는 고유값 (필수에 가깝)
            */}
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                {/* null 이면 '-' 표시. (A ?? B) = A 가 null/undefined 면 B */}
                <td>{customer.birthDate ?? '-'}</td>
                <td>{customer.status}</td>
                <td>
                  <Link
                    to={`/customers/${customer.id}/edit`}
                    style={{ marginRight: 8 }}
                  >
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(customer.id, customer.name)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CustomerList;
```

---

## 8-2. 상품 목록에 “고객 관리” 링크 (권장)

파일: `frontend/src/pages/InsuranceProductList.tsx`

제목 근처 (등록 링크 옆 등):

```tsx
<p>
  <Link to="/products/new" style={{ marginRight: 12 }}>상품 등록</Link>
  <Link to="/customers">고객 관리 →</Link>
</p>
```

(기존 마크업에 맞게 한 줄만 추가해도 됨)

---

## 8-3. 확인

1. Postman 으로 고객 1~2명 등록해 둔 상태 권장  
2. `http://localhost:5173/customers`  
3. 표에 이름·이메일이 보이는지  
4. F12 → Network → `customers` **GET** Status **200**  
5. 삭제 → 확인 → 행 사라짐 → Network **DELETE 204**

- [ ] 목록 표시  
- [ ] 삭제 동작  
- [ ] 상품 목록 링크 동작  

→ **Work 9**

---

# Work 9. 고객 등록 (Create) (40분)

## 목표

`/customers/new` 폼 → 검증 → `POST /api/customers` → 성공 시 `/customers` 로 이동 → 목록에 표시

## 머릿속 흐름

```
입력 state 변경 (onChange)
    →
제출 (onSubmit)
    → e.preventDefault()  (페이지 새로고침 막기)
    → 필수값 검사
    → createCustomer(body)
    → navigate('/customers')
```

---

## 9-1. `CustomerCreate.tsx` 전체 교체

```tsx
// ============================================================
// 고객 등록 화면
// 흐름: 입력 → 검사 → POST → 성공 시 목록(/customers) 이동
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCustomer } from '../api/customerApi.ts';
import type { CustomerRequest } from '../types/customer.ts';

function CustomerCreate() {
  // 성공 후 페이지 이동용
  const navigate = useNavigate();

  // ---------- 폼 필드 state ----------
  // 규칙: const [값, 설정함수] = useState(초기값)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // input type="date" 도 값은 문자열 "YYYY-MM-DD"
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('활성');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- 제출 ----------
  const handleSubmit = async (e: React.FormEvent) => {
    // HTML 기본 submit = 전체 새로고침. SPA 에서는 막는다
    e.preventDefault();
    setError(null);

    // 1차 검증 (서버 가기 전)
    if (!name.trim()) {
      setError('이름을 입력하세요.');
      return;
    }
    if (!email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }
    if (!phone.trim()) {
      setError('연락처를 입력하세요.');
      return;
    }

    // 서버에 보낼 몸통 (Postman JSON 과 동일 개념)
    const body: CustomerRequest = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      // 빈 문자열이면 필드 생략 (undefined)
      birthDate: birthDate.trim() || undefined,
      address: address.trim() || undefined,
      status: status || undefined,
    };

    try {
      setLoading(true);
      await createCustomer(body);
      // 성공 → 목록으로
      navigate('/customers');
    } catch (err) {
      console.error(err);
      setError('고객 등록에 실패했습니다. Network 탭과 서버 로그를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: 560 }}>
      <h1>고객 등록</h1>
      <p>
        <Link to="/customers">← 고객 목록</Link>
      </p>

      {/* error 가 있을 때만 빨간 박스 */}
      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            이름 *{' '}
            {/*
              제어 컴포넌트:
              value = state, onChange = state 갱신
              → 입력칸에 보이는 글자 = React 가 알고 있는 값
            */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            이메일 *{' '}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            연락처 *{' '}
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            생년월일{' '}
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            주소{' '}
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            상태{' '}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}

export default CustomerCreate;
```

---

## 9-2. 직접 확인

1. `/customers` → **+ 고객 등록**  
2. 예시 입력:

| 필드 | 값 |
|------|-----|
| 이름 | 화면등록테스트 |
| 이메일 | test@example.com |
| 연락처 | 010-0000-1111 |
| 생년월일 | (아무 날짜) |
| 상태 | 활성 |

3. **등록하기**  
4. `/customers` 로 이동 + 표에 행 추가  
5. Network: **POST** `/api/customers` → **201**

- [ ] 필수 비우면 에러 문구  
- [ ] 등록 성공 E2E  

→ **Work 10**

---

# Work 10. 고객 수정 (Update) (40분)

## 목표

1. URL 에서 id 읽기  
2. `GET /api/customers/{id}` 로 폼 채우기  
3. 저장 시 `PUT`  
4. 성공 시 목록으로  

상품 `InsuranceProductEdit.tsx` 와 **같은 골격**.

---

## 10-1. `CustomerEdit.tsx` 전체 교체

```tsx
// ============================================================
// 고객 수정 화면
// 흐름:
//   1) URL 의 :id 읽기
//   2) GET 으로 기존 데이터 → 폼 state 채우기
//   3) 사용자가 수정 → PUT → 목록 이동
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getCustomer,
  updateCustomer,
} from '../api/customerApi.ts';
import type { CustomerRequest } from '../types/customer.ts';

function CustomerEdit() {
  // URL: /customers/3/edit → id = "3"
  const { id } = useParams();
  const navigate = useNavigate();

  // 문자열 id → 숫자. 이상하면 NaN
  const customerId = Number(id);

  // 폼 필드
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('활성');

  // 처음 불러오는 중 / 저장 중
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- 기존 데이터 로드 ----------
  useEffect(() => {
    if (!id || Number.isNaN(customerId)) {
      setError('잘못된 고객 ID 입니다.');
      setInitialLoading(false);
      return;
    }

    // useEffect 안에서 async 직접 선언 대신, 내부 함수 후 즉시 호출
    const load = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        const data = await getCustomer(customerId);

        // 서버 값 → 각 input state
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        // null 이면 빈 문자열 (date input 은 null 대신 '')
        setBirthDate(data.birthDate ?? '');
        setAddress(data.address ?? '');
        setStatus(data.status);
      } catch (err) {
        console.error(err);
        setError('고객 정보를 불러오지 못했습니다.');
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, [id, customerId]);

  // ---------- 저장 ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('이름, 이메일, 연락처는 필수입니다.');
      return;
    }

    const body: CustomerRequest = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthDate: birthDate.trim() || undefined,
      address: address.trim() || undefined,
      status: status || undefined,
    };

    try {
      setSaving(true);
      await updateCustomer(customerId, body);
      navigate('/customers');
    } catch (err) {
      console.error(err);
      setError('고객 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <div style={{ padding: '20px' }}>불러오는 중...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: 560 }}>
      <h1>고객 수정</h1>
      <p>
        <Link to="/customers">← 고객 목록</Link>
      </p>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            이름 *{' '}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            이메일 *{' '}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            연락처 *{' '}
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            생년월일{' '}
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            주소{' '}
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            상태{' '}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  );
}

export default CustomerEdit;
```

---

## 10-2. 확인

1. 목록에서 **수정** 클릭  
2. 폼에 기존 값이 채워지는지  
3. 이름/연락처 바꿔 **저장하기**  
4. 목록에 반영  
5. Network: GET 단건 **200**, PUT **200**

- [ ] 로드  
- [ ] 저장  
- [ ] 목록 반영  

→ **Work 11**

---

# Work 11. 최종 E2E 체크리스트 (15분)

브라우저만으로:

| # | 시나리오 | 결과 |
|---|----------|------|
| 1 | `/` 상품 목록 정상 | ☐ |
| 2 | `/customers` 고객 목록 | ☐ |
| 3 | 고객 등록 → 목록에 표시 | ☐ |
| 4 | 고객 수정 → 값 변경 | ☐ |
| 5 | 고객 삭제 → 행 제거 | ☐ |
| 6 | 필수값 비우고 등록 → 에러 문구 | ☐ |
| 7 | F12 Network 에 CORS 빨간 에러 없음 | ☐ |

서버 터미널에 예외 스택이 반복해서 안 쌓이면 더 좋다.

**전부 체크되면 고객 CRUD 한 바퀴 완료.**  
축하한다. 이제 “패턴을 두 번 그린” 상태다.

---

# 학습 정리 (짧게)

## 백엔드에서 반복한 것

```
Entity → Repository → DTO → Service → Controller → (Postman)
```

## 프론트에서 반복한 것

```
types → api 함수 → Route → List → Create → Edit
```

## 다음에 도전하면 좋은 것 (참고만)

| 다음 | 배우는 것 |
|------|-----------|
| 계약(Policy) CRUD | 고객·상품 **연관관계** (`ManyToOne`) |
| 검증 어노테이션 | `@NotBlank` 등 + 에러 JSON |
| 예외 처리 | `@ControllerAdvice` 로 404/400 통일 |
| 검색·페이징 | `Pageable`, 쿼리 파라미터 |

지금은 **계약 코드를 넣지 않아도 된다.**  
이 매뉴얼 범위는 고객 독립 CRUD 까지.

---

# 부록: 문제 해결

## A. `customers` 테이블이 없다

- Entity 패키지·어노테이션 확인  
- `bootRun` 재시작  
- `spring.jpa.hibernate.ddl-auto=update` 인지 확인  
- MySQL 에서 `SHOW TABLES;` 로 `customers` 존재 확인  

## B. Postman POST 가 400 / 500

- Body 가 **raw + JSON** 인지  
- 필드명 camelCase (`birthDate` 이지 `birth_date` 아님 — JSON 기준)  
- 서버 로그 스택트레이스 읽기  

## C. 프론트 CORS 에러

- 백엔드 기동 여부  
- `WebConfig` 에 `http://localhost:5173`  
- 요청 URL 이 `http://localhost:8080/...` 인지 (5173 으로 API 치면 안 됨)

## D. 등록은 되는데 목록에 안 보임

- POST path 오타  
- 등록 후 `navigate` 주소가 `/customers` 인지  
- GET 목록 Network 응답 배열에 데이터가 있는지  

## E. 수정 화면이 비어 있음

- `useEffect` 의 `getCustomer` 호출 여부  
- URL id 와 Route `path="/customers/:id/edit"` 일치  
- GET 단건 200 인지  

## F. 날짜가 이상하다

- 보낼 때 `"YYYY-MM-DD"` 문자열  
- Entity 는 `LocalDate`  
- 빈 생년월일은 `undefined` / null 로 두기  

## G. 상품 화면이 깨졌다

- `App.tsx` 에서 상품 Route 를 실수로 지웠는지  
- import 경로 오타  

---

# 부록: 만들 파일 체크리스트

### 백엔드

- [ ] `entity/Customer.java`  
- [ ] `repository/CustomerRepository.java`  
- [ ] `dto/CustomerRequest.java`  
- [ ] `dto/CustomerResponse.java`  
- [ ] `service/CustomerService.java`  
- [ ] `controller/CustomerController.java`  
- [ ] Postman 5종 통과  

### 프론트

- [ ] `types/customer.ts`  
- [ ] `api/customerApi.ts`  
- [ ] `pages/CustomerList.tsx`  
- [ ] `pages/CustomerCreate.tsx`  
- [ ] `pages/CustomerEdit.tsx`  
- [ ] `App.tsx` Route 3개  
- [ ] (권장) 상품 목록 ↔ 고객 목록 링크  

---

# 부록: 보험상품 파일 나란히 보기 (추천 공부법)

구현할 때 IDE 에서 **Split** 으로 연다.

| 왼쪽 (이미 아는 것) | 오른쪽 (이번에 칠 것) |
|---------------------|------------------------|
| `InsuranceProduct.java` | `Customer.java` |
| `InsuranceProductService.java` | `CustomerService.java` |
| `InsuranceProductController.java` | `CustomerController.java` |
| `insuranceProductApi.ts` | `customerApi.ts` |
| `InsuranceProductList.tsx` | `CustomerList.tsx` |

**다른 점**만 동그라미 치면, “ ent 체 외운 것”이 아니라 “패턴을 이해한 것”이 된다.

---

수고했다.  
막히는 Work 번호를 알려 주면, 그 구간만 더 풀어 줄 수 있다.
