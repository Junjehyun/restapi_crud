# SQL 노트

| 항목 | 내용 |
|------|------|
| 이 문서 | SQL 기본 전부. DDL · DML · 조인 · 집계 · 제약 · 트랜잭션 |
| 예시 | 기본은 우리 `consultants`. 조인은 연습용 `users` / `orders` (아직 코드 없음) |
| 자바 단어 | `CRUD_WORD_BOOK.md` |
| 확인 | 서버 콘솔 `show-sql=true`, 또는 MySQL 에서 직접 |

문장은 **대소문자 안 가린다.** 이 노트는 키워드를 대문자로 써서 눈에 띄게만 한다.

---

## 0. SQL 이 뭐고, 문장은 네 종류

**SQL** = 데이터베이스에 하는 말.  
아주 쉽게: 엑셀 시트에게 “만들어”, “꺼내”, “고쳐”, “권한 줘”, “저장해” 라고 적는 쪽지.

우리 프로젝트는 자바(`save`, `findAll`)로 부탁하고, Hibernate 가 SQL 로 번역한다.  
그래도 SQL 을 읽지 못하면 콘솔에 찍힌 줄을 모른다.

| 종류 | 하는 일 | 예 |
|------|---------|----|
| **DDL** | 시트 자체를 만들거나 바꿈 | `CREATE TABLE`, `ALTER`, `DROP` |
| **DML** | 칸 안의 데이터를 다루 | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **DCL** | 누구를 허락하나 | `GRANT`, `REVOKE` |
| **TCL** | 묶음을 확정/취소 | `COMMIT`, `ROLLBACK` |

지금 앱이 매일 치는 것은 거의 **DML**.  
Entity 와 `ddl-auto=update` 가 대신 치는 것은 **DDL**.

```
Service.save / findAll / setter / deleteById
        │
        ▼
   Hibernate 번역
        │
        ▼
 INSERT / SELECT / UPDATE / DELETE     ← DML
 CREATE TABLE consultants ...          ← DDL (앱 켤 때)
        │
        ▼
      MySQL
```

---

## 1. 기본 단어

| 말 | 엑셀 | 우리 |
|----|------|------|
| 데이터베이스 | 파일 | `restapi_crud` |
| 테이블 | 시트 | `consultants` |
| 컬럼 (열) | 맨 위 제목 | `name`, `hire_date` |
| 행 (로우) | 가로 한 줄 | 설계사 한 명 |
| 기본키 PK | 줄 번호 | `id` |
| 외래키 FK | 다른 시트 줄 번호 | 아직 코드 없음. 주문 때 `user_id` |
| NULL | 칸이 비어 있음 | 이메일 안 넣은 설계사 |
| 스키마 | 시트들의 설계 | 테이블+컬럼+제약 |

자바는 낙타(`hireDate`), DB 는 뱀(`hire_date`).  
Entity `@Column(name = "hire_date")` 가 둘을 잇는다.

한 문장은 **동사로 시작**하고 **`;` 로 끝**낸다.

```sql
USE restapi_crud;
SHOW DATABASES;
SHOW TABLES;
DESCRIBE consultants;   -- 칸 이름과 타입
```

`--` 뒤는 주석. 실행되지 않는다.

---

## 2. 우리 테이블 (이미 있는 것)

### `consultants`

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT | PK |
| `name` | VARCHAR(50) NOT NULL | |
| `employee_code` | VARCHAR(20) NOT NULL | |
| `phone` | VARCHAR(20) NOT NULL | 하이픈 있는 문자열 |
| `email` | VARCHAR(100) | NULL 가능 |
| `hire_date` | DATE | NULL 가능 |
| `status` | VARCHAR(20) NOT NULL | 재직/휴직/퇴직 |
| `created_at` | DATETIME | 자동 |
| `updated_at` | DATETIME | 자동 |

고객 `customers`: `email` 필수, `birth_date`, `address`.  
상품 `insurance_products`: `company`, `type`, `monthly_premium`, `description`(TEXT).

---

## 3. DDL — 시트 만들기 / 고치기

아주 쉽게: 엑셀에서 **새 시트, 열 추가, 시트 삭제**. 칸 안의 사람 이름이 아니라 **시트 자체**.

### 데이터베이스

```sql
CREATE DATABASE restapi_crud
  DEFAULT CHARACTER SET utf8mb4;

USE restapi_crud;

DROP DATABASE 연습용;   -- 통째로 삭제. 복구 거의 불가. 연습 DB 아니면 치지 말 것
```

`utf8mb4` = 한글·이모지까지 되는 문자셋.

### CREATE TABLE

```sql
CREATE TABLE consultants (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  name           VARCHAR(50)  NOT NULL,
  employee_code  VARCHAR(20)  NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  email          VARCHAR(100) NULL,
  hire_date      DATE         NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT '재직',
  created_at     DATETIME     NULL,
  updated_at     DATETIME     NULL,
  PRIMARY KEY (id)
);
```

우리 앱은 이 문장을 손으로 안 친다. Entity + `ddl-auto=update` 가 비슷한 일을 한다.  
그래도 **이 문장을 읽을 수 있어야** 테이블이 보인다.

| 구문 | 뜻 |
|------|-----|
| `NOT NULL` | 빈칸 금지 |
| `NULL` | 빈칸 허용 (기본이 이쪽으로 가깝다) |
| `DEFAULT '재직'` | 안 넣으면 이 값 |
| `AUTO_INCREMENT` | id 를 1, 2, 3… DB 가 붙임 |
| `PRIMARY KEY (id)` | 이 줄의 이름표. 겹치면 안 됨 |

### ALTER TABLE — 이미 있는 시트 고치기

```sql
-- 열 추가
ALTER TABLE consultants ADD COLUMN memo VARCHAR(200) NULL;

-- 열 타입/제약 바꾸기
ALTER TABLE consultants MODIFY COLUMN phone VARCHAR(30) NOT NULL;

-- 열 이름 바꾸기
ALTER TABLE consultants CHANGE COLUMN memo note VARCHAR(200) NULL;

-- 열 삭제
ALTER TABLE consultants DROP COLUMN note;
```

Entity 에 필드를 추가하고 앱을 다시 켜면 `ddl-auto=update` 가 ADD COLUMN 비슷한 일을 한다.  
필드를 지워도 **컬럼이 자동으로 안 지워질 수 있다.** `update` 는 조심하는 모드다.

### DROP / TRUNCATE / DELETE

| 문장 | 무엇이 사라지나 | 되돌리기 |
|------|-----------------|----------|
| `DELETE FROM consultants WHERE id = 3;` | 그 행의 데이터 | 트랜잭션이면 ROLLBACK 가능 |
| `TRUNCATE TABLE consultants;` | **모든 행**. 시트는 남음. id 가 다시 1부터 | 보통 롤백 안 됨 |
| `DROP TABLE consultants;` | 시트 자체 (설계까지) | 거의 불가 |

아주 쉽게: DELETE 는 줄만 지움. TRUNCATE 는 시트 내용을 비움. DROP 은 시트지를 찢음.

---

## 4. 타입

| 타입 | 언제 | 우리 |
|------|------|------|
| `BIGINT` | 큰 정수 | `id` |
| `INT` | 일반 정수 | 연습용 개수 |
| `DECIMAL(10,0)` | 정확한 숫자. 돈 | `monthly_premium` |
| `FLOAT` / `DOUBLE` | 대략 소수 | **돈에 쓰지 말 것** |
| `VARCHAR(n)` | 짧은 글, 최대 n | `name` |
| `CHAR(n)` | 항상 n 글자 | 거의 안 씀 |
| `TEXT` | 긴 글 | 상품 `description` |
| `DATE` | 날짜만 | `hire_date` |
| `DATETIME` / `TIMESTAMP` | 날짜+시각 | `created_at` |
| `BOOLEAN` / `TINYINT(1)` | 참/거짓 | 아직 없음 |

`phone` 은 `INT` 가 아니다. `010-2222-3333` 과 앞자리 0 때문에 `VARCHAR`.

---

## 5. SELECT — 꺼내 보기

### 기본

```sql
SELECT * FROM consultants;

SELECT id, name, employee_code, status
FROM consultants;
```

`*` = 모든 열. 필요하면 열 이름을 적는다.

```sql
SELECT
  name AS 이름,
  employee_code AS 사번
FROM consultants;
```

`AS` = 별명. 결과 제목만 바뀐다. 테이블에도 붙인다. `consultants AS c`

### WHERE — 어떤 줄만

```sql
SELECT * FROM consultants WHERE id = 3;
SELECT * FROM consultants WHERE status = '재직';
SELECT * FROM consultants WHERE hire_date >= '2020-01-01';
```

문자열·날짜는 **작은따옴표** `'재직'`.

| 연산 | 뜻 |
|------|-----|
| `=` `<>` `!=` | 같다 / 다르다 |
| `>` `<` `>=` `<=` | 크기 |
| `AND` / `OR` / `NOT` | 그리고 / 또는 / 아님 |
| `IN ('재직', '휴직')` | 목록 중 하나 |
| `BETWEEN '2020-01-01' AND '2020-12-31'` | 사이 (양쪽 포함) |
| `LIKE` | 글자 패턴 |
| `IS NULL` / `IS NOT NULL` | 비었나 |

```sql
SELECT * FROM consultants
WHERE status = '재직' AND hire_date IS NOT NULL;

SELECT * FROM consultants
WHERE status IN ('재직', '휴직');

SELECT * FROM consultants
WHERE hire_date BETWEEN '2020-01-01' AND '2023-12-31';
```

괄호로 순서를 분명히 한다.

```sql
SELECT * FROM consultants
WHERE status = '퇴직'
   OR (status = '휴직' AND hire_date < '2015-01-01');
```

### NULL

NULL 은 “없음”이지 `''` 이나 `0` 이 아니다.

```sql
SELECT * FROM consultants WHERE email IS NULL;
SELECT * FROM consultants WHERE email IS NOT NULL;
```

`WHERE email = NULL` 은 쓰지 않는다. 결과가 비는 것이 정상처럼 보여 사고가 난다.

### LIKE

| 패턴 | 뜻 | 예 |
|------|-----|-----|
| `'박%'` | 박으로 시작 | 박설계 |
| `'%설계'` | 설계로 끝 | 김설계 |
| `'%박%'` | 박이 어디든 | 이박씨 |
| `'_박%'` | 두 번째 글자가 박 | |

```sql
SELECT * FROM consultants WHERE name LIKE '%박%';
SELECT * FROM customers    WHERE name LIKE '김%';
```

`07` 검색 `?name=김` 이 이런 WHERE 로 붙게 된다.

`%` 를 앞뒤에 붙이면 인덱스를 잘 못 타서 느려질 수 있다. 지금은 “부분 검색” 정도로 알아 둔다.

### DISTINCT · ORDER BY · LIMIT

```sql
SELECT DISTINCT status FROM consultants;

SELECT * FROM consultants
ORDER BY hire_date DESC, name ASC;

SELECT * FROM consultants
ORDER BY id DESC
LIMIT 10;          -- 앞에서 10명

SELECT * FROM consultants
ORDER BY id DESC
LIMIT 10 OFFSET 20;  -- 21번째부터 10명 (페이지)
```

`DESC` 큰 것/최근 먼저, `ASC` 작은 것 먼저 (기본).

JPA `findAll()` 은 지금 정렬·페이징이 없다. 콘솔 SELECT 도 그에 가깝다.

---

## 6. INSERT / UPDATE / DELETE

### INSERT

```sql
INSERT INTO consultants
  (name, employee_code, phone, email, hire_date, status, created_at, updated_at)
VALUES
  ('박설계', 'C-001', '010-2222-3333', 'park@example.com', '2020-03-01', '재직', NOW(), NOW());
```

`id` 는 안 넣는다. AUTO_INCREMENT.

여러 줄:

```sql
INSERT INTO consultants (name, employee_code, phone, status, created_at, updated_at)
VALUES
  ('김설계', 'C-002', '010-0000-0001', '재직', NOW(), NOW()),
  ('이설계', 'C-003', '010-0000-0002', '휴직', NOW(), NOW());
```

다른 행을 복사:

```sql
INSERT INTO consultants (name, employee_code, phone, status, created_at, updated_at)
SELECT name, CONCAT(employee_code, '-copy'), phone, status, NOW(), NOW()
FROM consultants
WHERE id = 1;
```

JPA `save(새 Entity)` → INSERT.

### UPDATE

```sql
UPDATE consultants
SET name = '박설계수정',
    hire_date = '2021-05-01',
    updated_at = NOW()
WHERE id = 3;
```

**WHERE 없으면 전 행이 바뀐다.**

JPA 더티 체킹은 **setter 로 손댄 칸만** SET 에 올린다.  
`setHireDate` 가 없으면 SQL 에 `hire_date` 가 없다 → DB 날짜 그대로.

### DELETE

```sql
DELETE FROM consultants WHERE id = 3;
DELETE FROM consultants WHERE status = '퇴직' AND hire_date < '2000-01-01';
```

역시 WHERE 없으면 전 행 삭제.  
지워도 id 는 보통 안 채워진다. 3 을 지우면 다음은 4.

JPA: `existsById` 후 `deleteById`.

---

## 7. 함수

### 문자열

```sql
SELECT
  CONCAT(name, ' (', employee_code, ')') AS 표시,
  LENGTH(name)                           AS 바이트길이,
  CHAR_LENGTH(name)                      AS 글자수,
  UPPER(email),
  LOWER(email),
  TRIM(name),
  SUBSTRING(phone, 1, 3)                 AS 앞자리
FROM consultants;
```

| 함수 | 뜻 |
|------|-----|
| `CONCAT(a, b)` | 이어 붙이기 |
| `TRIM` / `LTRIM` / `RTRIM` | 공백 제거 |
| `UPPER` / `LOWER` | 대소문자 |
| `SUBSTRING(s, 시작, 길이)` | 잘라내기 (시작은 1부터) |
| `REPLACE(s, '옛', '새')` | 바꿔 쓰기 |
| `CHAR_LENGTH` | 글자 수 (한글 1글자 = 1) |

프론트 `trim()` 과 같은 일을 DB 에서도 할 수 있다.

### 숫자

```sql
SELECT
  monthly_premium,
  ROUND(monthly_premium / 12, 0) AS 대략월,
  ABS(-10),
  MOD(10, 3)                     -- 나머지 1
FROM insurance_products;
```

### 날짜

```sql
SELECT
  NOW()                         AS 지금,
  CURDATE()                     AS 오늘,
  hire_date,
  YEAR(hire_date), MONTH(hire_date), DAY(hire_date),
  DATE_FORMAT(hire_date, '%Y-%m') AS 년월,
  DATEDIFF(CURDATE(), hire_date)  AS 입사경과일,
  DATE_ADD(hire_date, INTERVAL 1 YEAR)
FROM consultants;
```

`@CreationTimestamp` 가 넣는 값이 `NOW()` 에 가깝다.

### NULL 다루기

```sql
SELECT
  name,
  IFNULL(email, '(없음)')     AS 이메일,
  COALESCE(email, phone, '-') AS 연락수단
FROM consultants;
```

`IFNULL(칸, 대신)` — 그 칸이 NULL 이면 대신.  
`COALESCE(a, b, c)` — 왼쪽부터 처음으로 NULL 아닌 값.  
목록의 `hireDate ?? '-'` 와 같은 생각.

### CASE — 조건에 따라 칸 값

```sql
SELECT
  name,
  status,
  CASE status
    WHEN '재직' THEN '근무 중'
    WHEN '휴직' THEN '잠시 쉼'
    WHEN '퇴직' THEN '나감'
    ELSE '미정'
  END AS 상태설명
FROM consultants;
```

IF-else 를 SELECT 안에 쓴 것.

---

## 8. 집계 — 여러 줄을 숫자 하나로

| 함수 | 뜻 |
|------|-----|
| `COUNT(*)` | 행 수 |
| `COUNT(email)` | email 이 NULL 이 아닌 행 수 |
| `SUM(col)` | 합 |
| `AVG(col)` | 평균 |
| `MIN(col)` / `MAX(col)` | 최소 / 최대 |

```sql
SELECT COUNT(*) FROM consultants;
SELECT COUNT(*) FROM consultants WHERE status = '재직';

SELECT
  COUNT(*)              AS 상품수,
  AVG(monthly_premium)  AS 평균보험료,
  MIN(monthly_premium)  AS 최저,
  MAX(monthly_premium)  AS 최고,
  SUM(monthly_premium)  AS 합계
FROM insurance_products
WHERE status = '판매중';
```

### GROUP BY — 묶어서 세기

아주 쉽게: 상태별로 명단을 나눠 인원을 센다.

```sql
SELECT status, COUNT(*) AS 인원
FROM consultants
GROUP BY status;
```

| status | 인원 |
|--------|------|
| 재직 | 10 |
| 휴직 | 2 |
| 퇴직 | 1 |

`SELECT` 에 올린 일반 칸은 `GROUP BY` 에도 있어야 한다. `SELECT name, COUNT(*)` 처럼 이름과 집계를 섞으면 오류가 난다.

### HAVING — 묶인 뒤의 필터

`WHERE` 는 **묶기 전** 행. `HAVING` 은 **묶인 뒤** 결과.

```sql
SELECT status, COUNT(*) AS 인원
FROM consultants
WHERE hire_date IS NOT NULL      -- 먼저 입사일 있는 사람만
GROUP BY status
HAVING COUNT(*) >= 2;            -- 그다음 2명 이상인 상태만
```

---

## 9. JOIN — 두 시트를 옆으로 붙이기

우리 CRUD 세 테이블은 서로 **아직 연결이 없다.**  
로드맵 3단계 주문은 `누가(user_id)` `무엇을(product_id)` 이므로 JOIN 이 필요해진다.

아주 쉽게: 출석부(사용자)와 주문서(주문)를 **같은 번호로** 한 장으로 합친다.

연습용 (코드에 없음. 개념용으로만 만든다):

```sql
CREATE TABLE users (
  id    BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  name  VARCHAR(50)  NOT NULL
);

CREATE TABLE orders (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity   INT    NOT NULL DEFAULT 1,
  created_at DATETIME
);
```

`orders.user_id` 가 `users.id` 를 가리킨다. 이게 **외래키 관계**.

### INNER JOIN — 양쪽 다 있는 줄만

```sql
SELECT
  o.id        AS 주문번호,
  u.name      AS 누가,
  o.quantity  AS 몇개
FROM orders o
INNER JOIN users u ON o.user_id = u.id;
```

`ON` 뒤가 **붙이는 조건**. 보통 `자식.부모_id = 부모.id`.

주문은 있는데 사용자가 없으면 INNER 에서는 **안 나온다.**

### LEFT JOIN — 왼쪽은 다 남김

```sql
SELECT
  u.name,
  o.id AS 주문번호
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

사용자는 다 나오고, 주문 없는 사람은 주문번호가 NULL.  
“한 번도 안 산 사람”을 찾을 때:

```sql
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;
```

### RIGHT JOIN

오른쪽 테이블을 다 남김. `FROM orders RIGHT JOIN users` 는 위의 LEFT 와 자리를 바꾼 것.  
실무에서는 LEFT 로 통일하는 편이 많다.

### 상품까지 세 장

```sql
SELECT
  u.name              AS 구매자,
  p.name              AS 상품,
  o.quantity,
  p.monthly_premium
FROM orders o
INNER JOIN users u              ON o.user_id = u.id
INNER JOIN insurance_products p ON o.product_id = p.id;
```

JOIN 을 두 번. 주문 → 사람, 주문 → 상품.

그림:

```
users          orders              insurance_products
┌────┐         ┌────────────┐      ┌────┐
│ id │◄────────│ user_id    │      │ id │
│name│         │ product_id │──────►│name│
└────┘         │ quantity   │      └────┘
               └────────────┘
```

### CROSS JOIN (참고)

조건 없이 모든 조합. 거의 안 쓴다. WHERE 없는 JOIN 과 비슷하게 행이 폭발한다.

---

## 10. 서브쿼리 — 쿼리 안의 쿼리

```sql
-- 평균보다 보험료가 비싼 상품
SELECT name, monthly_premium
FROM insurance_products
WHERE monthly_premium > (
  SELECT AVG(monthly_premium) FROM insurance_products
);

-- 주문을 한 번이라도 한 사용자
SELECT name FROM users
WHERE id IN (SELECT user_id FROM orders);
```

괄호 안 SELECT 가 먼저 계산된다.  
JOIN 으로 바꿀 수 있는 경우가 많다. 둘 다 맞는 도구다.

```sql
-- FROM 자리에 쓰기 (인라인 뷰)
SELECT status, 인원
FROM (
  SELECT status, COUNT(*) AS 인원
  FROM consultants
  GROUP BY status
) t
WHERE 인원 >= 2;
```

---

## 11. UNION — 결과 세로로 붙이기

```sql
SELECT name, '설계사' AS 구분 FROM consultants
UNION ALL
SELECT name, '고객'   AS 구분 FROM customers;
```

| 구문 | 뜻 |
|------|-----|
| `UNION` | 중복 줄 제거 |
| `UNION ALL` | 중복 그대로. 더 빠르다 |

열 개수와 타입이 맞아야 한다. JOIN 이 가로 결합, UNION 은 세로 결합.

---

## 12. 제약 · 인덱스 · 키

테이블이 “어떤 값은 거부한다”고 정한 규칙.

| 제약 | 뜻 | 예 |
|------|-----|-----|
| `PRIMARY KEY` | 줄의 고유 이름표 | `id` |
| `NOT NULL` | 빈칸 금지 | `name` |
| `UNIQUE` | 값이 겹치면 안 됨 | 나중에 이메일 |
| `FOREIGN KEY` | 다른 테이블 id 만 허용 | `orders.user_id` |
| `DEFAULT` | 안 넣으면 이 값 | `'재직'` |
| `CHECK` | 값 범위 (MySQL 8+) | `quantity > 0` |

```sql
-- 이메일 중복 금지 (07 에서 다룰 409 와 짝)
ALTER TABLE customers ADD UNIQUE (email);

-- 주문은 있는 사용자만 (아직 우리 코드 없음)
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(id);
```

FK 가 있으면 없는 사용자 id 로 INSERT 가 거절된다.  
사용자를 지우려고 할 때 주문이 남아 있으면 그것도 거절될 수 있다.

**인덱스** = 목차. `WHERE employee_code = 'C-001'` 를 빠르게.  
PK 는 자동으로 인덱스가 있다.

```sql
CREATE INDEX idx_consultants_status ON consultants(status);
DROP INDEX idx_consultants_status ON consultants;
```

모든 칸에 인덱스를 달지 않는다. 쓰기(INSERT/UPDATE)가 느려진다.

`EXPLAIN SELECT ...` 는 “이 쿼리가 인덱스를 타나”를 보여 준다. 이름은 알아 두고, 지금은 필수 아니다.

---

## 13. 트랜잭션 (TCL)

아주 쉽게: 여러 쪽지를 **한 묶음**으로. 하나라도 실패하면 전부 취소.

자바 `@Transactional` 이 이 묶음이다.

```sql
START TRANSACTION;

UPDATE insurance_products SET status = '판매중지' WHERE id = 1;
INSERT INTO orders (user_id, product_id, quantity, created_at)
VALUES (1, 1, 2, NOW());

COMMIT;      -- 확정
-- ROLLBACK; -- 취소 (COMMIT 전에)
```

| 말 | 뜻 |
|----|-----|
| `START TRANSACTION` | 묶음 시작 |
| `COMMIT` | 냉장고에 확정 |
| `ROLLBACK` | 묶음 전부 없던 일로 |

자동 커밋이 켜져 있으면 문장 하나가 곧 COMMIT. 우리 앱은 보통 메서드가 끝날 때 한 번 COMMIT.

---

## 14. VIEW · DCL (이름만 제대로)

**VIEW** = 자주 쓰는 SELECT 에 이름 붙이기. 테이블처럼 `SELECT * FROM v_재직설계사`.

```sql
CREATE VIEW v_재직설계사 AS
SELECT id, name, employee_code
FROM consultants
WHERE status = '재직';

SELECT * FROM v_재직설계사;
```

데이터 복사가 아니다. 창문을 하나 만든 것.

**DCL**

```sql
GRANT SELECT, INSERT ON restapi_crud.* TO 'app'@'localhost';
REVOKE INSERT ON restapi_crud.* FROM 'app'@'localhost';
```

앱 계정에는 SELECT/INSERT/UPDATE/DELETE 만 주고, DROP DATABASE 는 안 주는 식.  
로컬 `root` 로 연습 중이면 당장은 안 친다.

---

## 15. 실행 순서 (SELECT 가 돌아가는 순)

적는 순서와 **엔진이 생각하는 순서**가 다르다.

```
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

그래서 `WHERE` 에 `COUNT(*)` 를 못 쓰고, `HAVING` 에 쓴다.  
`SELECT` 별명 `인원` 을 `WHERE` 에서 못 쓰는 경우가 많다 (HAVING / 바깥 쿼리에서).

---

## 16. 우리 프로젝트 치트시트

| 자바 | SQL |
|------|-----|
| `findAll()` | `SELECT * FROM consultants` |
| `findById(3)` | `SELECT * FROM consultants WHERE id = 3` |
| `existsById(3)` | 그 id 행이 있나 (COUNT/EXISTS) |
| `save(새 객체)` | `INSERT INTO consultants (...) VALUES (...)` |
| setter + `@Transactional` 종료 | `UPDATE consultants SET ... WHERE id = ?` |
| `deleteById(3)` | `DELETE FROM consultants WHERE id = 3` |
| Entity + `ddl-auto=update` | `CREATE TABLE` / `ALTER TABLE ADD` 에 가까움 |
| `@CreationTimestamp` | `created_at = NOW()` 에 가까움 |
| 다음 `07` 이름 검색 | `WHERE name LIKE '%김%'` |
| 다음 로그인 User | `CREATE TABLE users` + UNIQUE email |
| 다음 주문 | `JOIN` + FK |

콘솔의 `?` 는 자리 표시. 실제 값은 바인딩 로그에 있다.

---

## 17. 손으로 연습 (MySQL)

```sql
USE restapi_crud;

-- DDL 확인
SHOW TABLES;
DESCRIBE consultants;

-- 조회
SELECT id, name, status FROM consultants ORDER BY id DESC LIMIT 5;
SELECT status, COUNT(*) AS 인원 FROM consultants GROUP BY status;
SELECT * FROM consultants WHERE name LIKE '%박%';

-- 쓰기 (연습 행)
INSERT INTO consultants
  (name, employee_code, phone, status, created_at, updated_at)
VALUES
  ('연습이', 'C-SQL', '010-9999-0000', '재직', NOW(), NOW());

UPDATE consultants
SET hire_date = '2024-01-01', status = '휴직', updated_at = NOW()
WHERE employee_code = 'C-SQL';

SELECT id, name, hire_date, status FROM consultants WHERE employee_code = 'C-SQL';

DELETE FROM consultants WHERE employee_code = 'C-SQL';
```

조인 연습은 9장의 `users` / `orders` 를 **연습 DB** 에만 만들고, 우리 앱 테이블은 DROP 하지 말 것.

---

## 18. 지금 깊게 안 파는 것

이름은 알아 두고, 문장은 나중에.

| 말 | 한 줄 |
|----|--------|
| 윈도우 함수 `ROW_NUMBER` / `RANK` | 줄마다 순위 |
| CTE `WITH ... AS` | 서브쿼리에 이름 |
| 스토어드 프로시저 | DB 안에 함수처럼 저장 |
| 트리거 | INSERT 때 자동으로 다른 일 |
| 파티션 / 샤딩 | 큰 테이블 쪼개기 |
| N+1 | JPA 가 JOIN 없이 SELECT 를 여러 번 치는 사고. 주문 때 만남 |

이 노트의 목표: **DDL 을 읽고, DML 네 동사를 치고, WHERE/JOIN/GROUP BY 를 그림으로 설명할 수 있으면** 충분하다.
