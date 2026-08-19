package com.yama331.restapi_crud.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS 설정 클래스
 *
 * [CORS란?]
 * - 브라우저가 다른 출처(Origin)의 요청을 차단하는 보안 정책을 풀어주는 설정이다.
 * - 프론트엔드(localhost:5173)와 백엔드(localhost:8080)는 포트가 다르기 때문에
 *   브라우저 입장에서는 "다른 출처"로 인식된다.
 * - 이 설정을 하지 않으면 React에서 API를 호출할 때 CORS 에러가 발생한다.
 */
@Configuration // Spring 설정 클래스임을 선언
public class WebConfig implements WebMvcConfigurer {
    // WebMvcConfigurer -> 스프링 웹 설정에 끼어들 수 있는 인터페이스, CORS를 열려면 이 약속을 구현한다.
    /**
     * CORS 매핑 설정
     *
     * @param registry CORS 설정을 등록하는 객체
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            // 허용할 프론트엔드 주소 (vite 기본 포트: 5173)
            .allowedOrigins("http://localhost:5173")
            // 허용할 HTTP 메서드
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            // 허용할 헤더 (모든 헤더 허용)
            .allowedHeaders("*")
            // 쿠키/인증 정보 포함 여부 (지금은 false로 둬도 됨)
            .allowCredentials(true)
            // preflight 요청 결과를 얼마나 캐시할지 (초 단위)
            .maxAge(3600);
    }
    
}
