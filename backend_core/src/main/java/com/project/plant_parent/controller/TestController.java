package com.project.plant_parent.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestController {
    @GetMapping("/user")
    public String userP() {
        return "user controller";
    }

    @GetMapping("/main")
    public String mainP() {
        return "main Controller";
    }
}
