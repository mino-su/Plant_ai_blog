package com.project.plant_parent.security;

import com.project.plant_parent.entity.Authority;
import com.project.plant_parent.entity.Member;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
@RequiredArgsConstructor
// Spring security가 이해하는 유저형태(UserDetails)와 우리 DB의 유저형태(Member)를 연결해주는 어댑터
public class UserDetailsImpl implements UserDetails {

    // 우리의 실제 유저 엔티티
    private final Member member;

    // 권한 목록 가져오기
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Authority role = member.getAuthority();
        String authority = role.toString(); // "ROLE_USER", "ROLE_ADMIN"

        SimpleGrantedAuthority simpleGrantedAuthority = new SimpleGrantedAuthority(authority);
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(simpleGrantedAuthority);
        return authorities;
    }

    @Override
    public @Nullable String getPassword() {
        return member.getPassword();
    }

    @Override
    public String getUsername() {
        return member.getEmail();
    }

    @Override
    public boolean isEnabled() {
        return true; // 항상 활성화 상태로 간주
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 자격 증명은 만료되지 않음
    }
    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정은 잠겨있지 않음
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정은 만료되지 않음
    }
}
