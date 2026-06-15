package com.xx.music.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    private String type = "password"; // "password" 或 "sms"

    @NotBlank(message = "账号不能为空", groups = {PasswordLogin.class})
    private String account; // 密码登录时的账号/手机号

    @NotBlank(message = "密码不能为空", groups = {PasswordLogin.class})
    private String password; // 密码登录时的密码

    @NotBlank(message = "手机号不能为空", groups = {SmsLogin.class})
    private String phone; // 验证码登录时的手机号

    @NotBlank(message = "验证码不能为空", groups = {SmsLogin.class})
    private String code; // 验证码登录时的验证码

    public interface PasswordLogin {}
    public interface SmsLogin {}
}
