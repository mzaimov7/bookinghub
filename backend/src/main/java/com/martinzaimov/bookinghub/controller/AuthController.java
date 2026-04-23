package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.LoginRequest;
import com.martinzaimov.bookinghub.dto.RegisterRequest;
import com.martinzaimov.bookinghub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(auth.login(req));
    }

    @PostMapping("/dev-login/{role}")
    public ResponseEntity<?> loginAsDev(@PathVariable String role) {
        return ResponseEntity.ok(auth.loginAsDev(role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        auth.register(req);
        return ResponseEntity.ok().build();
    }
}
