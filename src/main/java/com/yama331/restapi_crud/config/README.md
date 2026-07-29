# config 폴더

## 한 줄 요약
**앱 전역 설정(환경 세팅)을 모아 두는 곳.**

## PHP로 비유하면
- Laravel의 `config/` 폴더
- CORS, 보안, 공통 Bean 등록 같은 **앱 전체 설정**

비즈니스 로직이 아니라, “앱이 어떻게 동작할지”를 정하는 코드입니다.

## 여기에 자주 넣는 것
| 설정 | 설명 |
|------|------|
| CORS | React(5173) → Spring(8080) 요청 허용 |
| Security | 로그인/권한 (나중에) |
| 공통 설정 클래스 | `@Configuration` 으로 등록하는 설정 |

## 여기서 하지 않는 일
- CRUD 업무 로직 (→ `service`)
- URL 처리 (→ `controller`)
- DB 저장/조회 (→ `repository`)

## 예시
```java
@Configuration
public class WebConfig {
    // 예: CORS 허용 설정
}
```

## 비유
식당 오픈 전 **매장 규칙 세팅**  
영업시간, 입장 가능 손님(CORS), 기본 정책 등. 요리(업무 로직) 자체는 아님.
