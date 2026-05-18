package com.martinzaimov.bookinghub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> bad(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldMessages = new LinkedHashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            if (!fieldMessages.containsKey(error.getField())) {
                fieldMessages.put(error.getField(), error.getDefaultMessage());
            }
        }

        String message = fieldMessages.isEmpty()
                ? "Validation failed"
                : fieldMessages.entrySet()
                        .stream()
                        .map(entry -> entry.getKey() + ": " + entry.getValue())
                        .reduce((left, right) -> left + "; " + right)
                        .orElse("Validation failed");

        return ResponseEntity.badRequest().body(Map.of(
                "message", message,
                "errors", fieldMessages
        ));
    }
}
