package com.martinzaimov.bookinghub.dto;

public class AuthResponse {

    public Long userId;
    public String username;
    public String email;
    public String role;
    public boolean devMode;

    public static AuthResponse of(Long userId, String username, String email, String role, boolean devMode) {
        AuthResponse response = new AuthResponse();
        response.userId = userId;
        response.username = username;
        response.email = email;
        response.role = role;
        response.devMode = devMode;
        return response;
    }
}
