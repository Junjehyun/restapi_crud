# entity 폴더

## 한 줄 요약
**DB 테이블 1개 ≈ Java 클래스 1개. 테이블의 한 행(row)을 표현하는 객체.**

## PHP로 비유하면
- Laravel **Eloquent Model** (`User`, `Post` 클래스)
- 테이블 컬럼이 클래스의 필드(property)가 됨

```
DB 테이블 users
id | name | email
1  | Kim  | a@b.com

↓ Entity 클래스

@Entity
class User {
  Long id;
  String name;
  String email;
}
```

## 여기서 하는 일
- 테이블과 컬럼 매핑 (`@Entity`, `@Table`, `@Column`)
- PK 정의 (`@Id`)
- 테이블 간 관계 표현 (`@OneToMany` 등, 필요할 때)

## 주의
- Entity는 **DB 구조에 가깝게** 둠
- 프론트에 그대로 노출하기보다, 보통 **DTO로 변환**해서 응답하는 편이 안전함

## 비유
**엑셀 표(테이블)의 한 줄**을 프로그램 안 객체로 옮긴 것.
