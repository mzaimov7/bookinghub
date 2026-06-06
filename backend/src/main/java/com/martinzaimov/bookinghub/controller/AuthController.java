package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.ForgotPasswordRequest;
import com.martinzaimov.bookinghub.dto.LoginRequest;
import com.martinzaimov.bookinghub.dto.RegisterRequest;
import com.martinzaimov.bookinghub.dto.ResetPasswordRequest;
import com.martinzaimov.bookinghub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

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
    public ResponseEntity<?> devLogin(@PathVariable String role) {
        return ResponseEntity.ok(auth.loginAsDev(role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        auth.register(req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        auth.requestPasswordReset(req);
        return ResponseEntity.ok(Map.of("message", "Ако има профил с този имейл, ще получите линк за смяна на паролата."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        auth.resetPassword(req);
        return ResponseEntity.ok(Map.of("message", "Паролата беше сменена успешно."));
    }

    @PostMapping(path = "/register/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadRegisterPhoto(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("photoUrl", auth.uploadRegistrationPhoto(file)));
    }
}
