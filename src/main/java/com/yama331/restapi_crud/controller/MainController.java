package com.yama331.restapi_crud.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class MainController {

    @GetMapping("/test")
    public String test() {
        return "Hello World";
    }

}
