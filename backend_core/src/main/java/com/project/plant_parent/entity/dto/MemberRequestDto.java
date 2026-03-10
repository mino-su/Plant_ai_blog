package com.project.plant_parent.entity.dto;

import com.project.plant_parent.entity.Authority;
import com.project.plant_parent.entity.Member;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MemberRequestDto {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min=8, max= 50)
    private String password;
    @NotBlank @Size(max=30)
    private String username;

    public Member toMember(PasswordEncoder passwordEncoder) {
        return Member.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .username(username)
                .authority(Authority.ROLE_USER)
                .build();
    }
}
