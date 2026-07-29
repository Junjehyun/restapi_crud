# repository 폴더

## 한 줄 요약
**DB와 직접 대화하는 곳. 저장·조회·수정·삭제(CRUD)의 DB 접근 담당.**

## PHP로 비유하면
- Laravel **Eloquent** 의 `User::find()`, `User::create()` 같은 DB 접근
- 또는 `DB::table('users')->where(...)->get()` 같은 **데이터 접근 계층**

Spring에서는 보통 인터페이스만 만들면, JPA가 구현체를 자동 생성합니다.

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // findById, save, delete 등은 기본 제공
    Optional<User> findByEmail(String email); // 이름 규칙으로 쿼리 자동 생성
}
```

## 여기서 하는 일
- Entity를 DB에 저장 (`save`)
- ID / 조건으로 조회 (`findById`, `findAll` 등)
- 삭제 (`delete`)
- 커스텀 조회 메서드 정의

## 여기서 하지 않는 일
- HTTP 요청 처리 (→ `controller`)
- “중복이면 에러” 같은 업무 판단 (→ `service`)

## 비유
식당의 **식재료 창고 관리자**  
주방에서 “재료 가져와 / 넣어둬”라고 하면 DB(창고)에서 꺼내거나 넣음.
