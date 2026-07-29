# controller 폴더

## 한 줄 요약
**밖(브라우저, 프론트)에서 오는 HTTP 요청을 받는 입구.**

## PHP로 비유하면
- Laravel / CodeIgniter의 **Controller**
- 또는 `routes/web.php`에 연결되는 **라우트 처리 함수**

```
브라우저 → GET /users 요청
         → Controller가 받아서
         → Service에 일 시키고
         → 결과를 JSON으로 응답
```

## 여기서 하는 일
- URL과 HTTP 메서드 매핑 (`GET`, `POST`, `PUT`, `DELETE`)
- 요청 파라미터 / body 받기
- Service 호출
- 결과(JSON)를 프론트에 반환

## 여기서 하지 않는 일
- DB 직접 조회 (→ `repository`)
- 복잡한 비즈니스 로직 (→ `service`)

## 예시 흐름
```
@RestController
@RequestMapping("/api/users")
public class UserController {
    // GET  /api/users      → 목록
    // GET  /api/users/1    → 단건
    // POST /api/users      → 생성
    // PUT  /api/users/1    → 수정
    // DELETE /api/users/1  → 삭제
}
```

## 비유
식당의 **웨이터**  
손님(요청)을 받고, 주방에 전달하고, 음식(응답)을 가져다 줌.
