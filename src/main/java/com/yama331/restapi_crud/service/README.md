# service 폴더

## 한 줄 요약
**실제 업무 로직(비즈니스 로직)을 처리하는 곳.**

## PHP로 비유하면
- Laravel의 **Service 클래스**
- Controller에 넣기엔 긴 로직을 따로 뺀 **비즈니스 로직 계층**

```
Controller: "회원 생성해줘"
Service:    "이메일 중복 체크 → 비밀번호 해시 → 저장 → 결과 정리"
```

## 여기서 하는 일
- 유효성 / 규칙 검사 (예: 중복 이메일 불가)
- 여러 Repository를 조합해서 처리
- 트랜잭션이 필요한 흐름 관리
- Controller가 쓰기 쉽게 결과 정리

## 여기서 하지 않는 일
- URL 매핑 (→ `controller`)
- SQL/JPA 쿼리 직접 작성 (→ `repository`)

## 예시 흐름
```
UserService.create(dto)
  1) 이메일 중복 확인
  2) Entity로 변환
  3) repository.save()
  4) 응답용 DTO로 변환해서 반환
```

## 비유
식당의 **주방장**  
웨이터(Controller)가 주문을 넘기면, 조리 순서·레시피를 결정하고 실행.
