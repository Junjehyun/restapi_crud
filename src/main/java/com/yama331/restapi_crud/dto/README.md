# dto 폴더

## 한 줄 요약
**API 요청/응답용 데이터 상자. DB 테이블과 1:1이 아닐 수 있음.**

DTO = **D**ata **T**ransfer **O**bject (데이터를 옮기기 위한 객체)

## PHP로 비유하면
- Form Request / Request 배열 (`$request->only(...)`)
- API JSON 응답용으로 만든 배열·객체
- Entity(Model) 전체를 그대로 주지 않고, **필요한 필드만 골라 담은 구조**

```
프론트가 보내는 JSON:
{ "name": "Kim", "email": "a@b.com" }
        ↓
CreateUserRequest (DTO)

서버가 돌려주는 JSON:
{ "id": 1, "name": "Kim", "email": "a@b.com" }
        ↓
UserResponse (DTO)
```

## 왜 Entity를 그대로 안 쓰나?
| Entity | DTO |
|--------|-----|
| DB 구조 반영 | API 계약(프론트와 약속) 반영 |
| 비밀번호 등 민감 필드 포함 가능 | 보여줄 것만 포함 |
| 테이블 변경 시 API까지 영향 | API 형태를 따로 유지 가능 |

## 여기서 하는 일
- 생성/수정 요청 body 받기 (`XxxRequest`)
- 목록/상세 응답 형태 정의 (`XxxResponse`)
- 필요 시 Entity ↔ DTO 변환

## 비유
손님에게 주는 **메뉴판/주문서**  
창고 재고 장부(Entity) 전체를 보여주지 않고, 필요한 정보만 정리한 문서.
