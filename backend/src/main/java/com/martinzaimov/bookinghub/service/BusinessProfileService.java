package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.BusinessProfileOTD;
import com.martinzaimov.bookinghub.dto.ChangePasswordRequest;
import com.martinzaimov.bookinghub.dto.UpdateBusinessProfileRequest;
import com.martinzaimov.bookinghub.entity.BusinessProfile;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.BusinessProfileRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@org.springframework.stereotype.Service
public class BusinessProfileService {

    private final UserRepository users;
    private final BusinessProfileRepository businessProfiles;
    private final PasswordEncoder passwordEncoder;
    private final Path uploadDir;

    public BusinessProfileService(
            UserRepository users,
            BusinessProfileRepository businessProfiles,
            PasswordEncoder passwordEncoder,
            @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.users = users;
        this.businessProfiles = businessProfiles;
        this.passwordEncoder = passwordEncoder;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public BusinessProfileOTD getProfile(Long userId) {
        User user = requireBusinessUser(userId);
        BusinessProfile profile = businessProfiles.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Business profile not found"));

        return toDto(user, profile);
    }

    public void verifyProfilePassword(Long userId, String password) {
        User user = requireBusinessUser(userId);
        if (password == null || password.isBlank()) {
          throw new ResponseStatusException(BAD_REQUEST, "Текущата парола е задължителна");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
          throw new ResponseStatusException(BAD_REQUEST, "Невалидна парола");
        }
    }

    @Transactional
    public BusinessProfileOTD uploadProfilePhoto(Long userId, MultipartFile file) {
        User user = requireBusinessUser(userId);
        BusinessProfile profile = businessProfiles.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Business profile not found"));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Моля избери снимка");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(BAD_REQUEST, "Разрешени са само снимки");
        }

        String filename = "business_" + userId + "_" + UUID.randomUUID() + extensionOf(file.getOriginalFilename());
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            profile.setPhotoUrl("/uploads/" + filename);
            businessProfiles.save(profile);
        } catch (IOException ex) {
            throw new IllegalStateException("Неуспешно качване на снимката");
        }

        return toDto(user, profile);
    }

    @Transactional
    public BusinessProfileOTD updateProfile(Long userId, UpdateBusinessProfileRequest request) {
        User user = requireBusinessUser(userId);
        BusinessProfile profile = businessProfiles.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Business profile not found"));

        String username = normalize(request.username);
        String email = normalize(request.email);
        String providerType = normalize(request.providerType);
        String businessName = normalize(request.businessName);
        String city = normalize(request.city);
        String address = normalize(request.address);

        if (username == null || email == null || providerType == null || businessName == null || city == null || address == null) {
            throw new IllegalArgumentException("Username, email, provider type, business name, city and address are required");
        }

        users.findByUsernameIgnoreCase(username)
                .filter(found -> !Objects.equals(found.getId(), userId))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Username already taken");
                });

        users.findByEmailIgnoreCase(email)
                .filter(found -> !Objects.equals(found.getId(), userId))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Email already used");
                });

        user.setUsername(username);
        user.setEmail(email.toLowerCase());
        users.save(user);

        BusinessProfile.ProviderType nextProviderType;
        try {
            nextProviderType = BusinessProfile.ProviderType.valueOf(providerType.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Невалиден тип на бизнес профила");
        }

        if (nextProviderType == BusinessProfile.ProviderType.COMPANY
                && (normalize(request.companyLegalName) == null || normalize(request.companyEik) == null || normalize(request.companyRepresentative) == null)) {
            throw new ResponseStatusException(BAD_REQUEST, "Име на фирмата, ЕИК и МОЛ са задължителни при фирмен профил");
        }

        profile.setProviderType(nextProviderType);
        profile.setBusinessName(businessName);
        profile.setCompanyLegalName(nextProviderType == BusinessProfile.ProviderType.COMPANY ? normalize(request.companyLegalName) : null);
        profile.setCompanyEik(nextProviderType == BusinessProfile.ProviderType.COMPANY ? normalize(request.companyEik) : null);
        profile.setCompanyRepresentative(nextProviderType == BusinessProfile.ProviderType.COMPANY ? normalize(request.companyRepresentative) : null);
        profile.setCity(city);
        profile.setAddress(address);
        profile.setPhone(normalize(request.phone));
        profile.setDescription(request.description != null ? normalize(request.description) : profile.getDescription());
        businessProfiles.save(profile);

        return toDto(user, profile);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = requireBusinessUser(userId);
        if (request.currentPassword == null || request.currentPassword.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Текущата парола е задължителна");
        }
        if (!passwordEncoder.matches(request.currentPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(BAD_REQUEST, "Текущата парола е грешна");
        }
        if (request.newPassword == null || request.newPassword.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Новата парола е задължителна");
        }
        if (!request.newPassword.equals(request.confirmPassword)) {
            throw new ResponseStatusException(BAD_REQUEST, "Новата парола и потвърждението не съвпадат");
        }
        if (passwordEncoder.matches(request.newPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(BAD_REQUEST, "Новата парола трябва да е различна от текущата");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword));
        users.save(user);
    }

    private User requireBusinessUser(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        if (user.getRole() != User.Role.BUSINESS) {
            throw new ResponseStatusException(BAD_REQUEST, "Business profile required");
        }
        return user;
    }

    private BusinessProfileOTD toDto(User user, BusinessProfile profile) {
        return new BusinessProfileOTD(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                profile.getProviderType().name(),
                profile.getBusinessName(),
                profile.getCompanyLegalName(),
                profile.getCompanyEik(),
                profile.getCompanyRepresentative(),
                profile.getCity(),
                profile.getAddress(),
                profile.getPhone(),
                profile.getDescription(),
                profile.getPhotoUrl()
        );
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String extensionOf(String originalFilename) {
        if (originalFilename == null) return "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == originalFilename.length() - 1) return "";
        return originalFilename.substring(dotIndex);
    }
}
