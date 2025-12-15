package com.project.plant_parent.entity;

import lombok.Getter;

@Getter
public enum Authority {
    ROLE_ADMIN("관리자"),
    ROLE_USER("사용자");

    private final String value;

    Authority(String value) {
        this.value = value;
    }
}
