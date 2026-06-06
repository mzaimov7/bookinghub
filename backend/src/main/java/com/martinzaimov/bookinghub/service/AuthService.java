package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.AuthResponse;
import com.martinzaimov.bookinghub.dto.ForgotPasswordRequest;
import com.martinzaimov.bookinghub.dto.LoginRequest;
import com.martinzaimov.bookinghub.dto.RegisterRequest;
import com.martinzaimov.bookinghub.dto.ResetPasswordRequest;
import com.martinzaimov.bookinghub.entity.PasswordResetToken;
import com.martinzaimov.bookinghub.entity.BusinessProfile;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.BusinessProfileRepository;
import com.martinzaimov.bookinghub.repo.ClientProfileRepository;
import com.martinzaimov.bookinghub.repo.PasswordResetTokenRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class AuthService {

    private final UserRepository users;
    private final ClientProfileRepository clientProfiles;
    private final BusinessProfileRepository businessProfiles;
    private final PasswordResetTokenRepository passwordResetTokens;
    private final PasswordEncoder encoder;
    private final EmailService emailService;
    private final Path uploadDir;
    private final String frontendBaseUrl;
    private final String supportEmail;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository users,
                       ClientProfileRepository clientProfiles,
                       BusinessProfileRepository businessProfiles,
                       PasswordResetTokenRepository passwordResetTokens,
                       PasswordEncoder encoder,
                       EmailService emailService,
                       @Value("${app.upload.dir:uploads}") String uploadDir,
                       @Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl,
                       @Value("${app.support.email:bookinghub.support@gmail.com}") String supportEmail) {
        this.users = users;
        this.clientProfiles = clientProfiles;
        this.businessProfiles = businessProfiles;
        this.passwordResetTokens = passwordResetTokens;
        this.encoder = encoder;
        this.emailService = emailService;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
        this.frontendBaseUrl = stripTrailingSlash(frontendBaseUrl);
        this.supportEmail = supportEmail;
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String identifier = safeTrim(req.identifier);
        if (identifier == null) {
            throw new IllegalArgumentException("Въведи потребителско име или имейл");
        }

        User user = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new IllegalArgumentException("Невалидно потребителско име, имейл или парола"));

        if (!user.isActive()) {
            String reason = safeTrim(user.getBanReason());
            throw new IllegalArgumentException(
                    "Вашият профил е ограничен."
                            + (reason == null ? "" : " Причина: " + reason + ".")
                            + " Ако смятате, че това е грешка, свържете се с " + supportEmail + "."
            );
        }
        if (!encoder.matches(req.password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Невалидно потребителско име, имейл или парола");
        }

        user.setLastLoginAt(LocalDateTime.now());
        users.save(user);

        return AuthResponse.of(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                false
        );
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest req) {
        String email = safeTrim(req.email);
        if (email == null) {
            return;
        }

        users.findByEmailIgnoreCase(email).ifPresent(user -> {
            String token = createRawToken();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUserId(user.getId());
            resetToken.setTokenHash(hashToken(token));
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
            passwordResetTokens.save(resetToken);

            String link = frontendBaseUrl + "/reset-password?token=" + token;
            emailService.send(
                    user.getEmail(),
                    "Смяна на парола в BookingHub",
                    "Здравей, " + user.getUsername() + "!\n\n" +
                            "Получихме заявка за смяна на паролата ти. Отвори линка и въведи нова парола:\n" +
                            link + "\n\n" +
                            "Линкът е валиден 30 минути. Ако не си правил тази заявка, можеш да игнорираш имейла."
            );
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        if (!safe(req.newPassword).equals(safe(req.confirmPassword))) {
            throw new IllegalArgumentException("Новата парола и потвърждението не съвпадат");
        }
        validatePassword(req.newPassword);

        PasswordResetToken token = passwordResetTokens.findByTokenHashAndUsedAtIsNull(hashToken(req.token))
                .orElseThrow(() -> new IllegalArgumentException("Линкът за смяна на парола е невалиден или вече е използван"));
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Линкът за смяна на парола е изтекъл");
        }

        User user = users.findById(token.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Потребителят не е намерен"));
        user.setPasswordHash(encoder.encode(req.newPassword));
        users.save(user);

        token.setUsedAt(LocalDateTime.now());
        passwordResetTokens.save(token);
    }

    @Transactional
    public AuthResponse loginAsDev(String rawRole) {
        User.Role role = parseDevRole(rawRole);
        User user = users.findByUsernameIgnoreCase(devUsername(role))
                .orElseGet(() -> createDevUser(role));

        user.setActive(true);
        user.setRole(role);
        user.setLastLoginAt(LocalDateTime.now());
        users.save(user);

        if (role == User.Role.CLIENT) {
            ensureDevClientProfile(user);
        } else if (role == User.Role.BUSINESS) {
            ensureDevBusinessProfile(user);
        }

        return AuthResponse.of(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                true
        );
    }

    @Transactional
    public void register(RegisterRequest req) {
        String role = req.role == null ? "" : req.role.trim().toUpperCase();

        if (users.existsByUsernameIgnoreCase(req.username)) {
            throw new IllegalArgumentException("Потребителското име вече е заето");
        }
        if (users.existsByEmailIgnoreCase(req.email)) {
            throw new IllegalArgumentException("Имейлът вече се използва");
        }
        if (!role.equals("CLIENT") && !role.equals("BUSINESS")) {
            throw new IllegalArgumentException("Невалиден тип профил");
        }
        validatePassword(req.password);

        User u = new User();
        u.setUsername(req.username.trim());
        u.setEmail(req.email.trim().toLowerCase());
        u.setPasswordHash(encoder.encode(req.password));
        u.setRole(User.Role.valueOf(role));
        u.setActive(true);
        users.save(u);

        if (role.equals("CLIENT")) {
            if (isBlank(req.firstName) || isBlank(req.lastName)) {
                throw new IllegalArgumentException("Името и фамилията са задължителни");
            }
            ClientProfile cp = new ClientProfile();
            cp.setUser(u);
            cp.setFirstName(req.firstName.trim());
            cp.setLastName(req.lastName.trim());
            cp.setPhone(safeTrim(req.phone));
            cp.setPhotoUrl(safeTrim(req.photoUrl));
            cp.setBio(safeTrim(req.bio));
            clientProfiles.save(cp);
        } else {
            if (isBlank(req.providerType) || isBlank(req.businessName) || isBlank(req.city) || isBlank(req.address) || isBlank(req.businessPhone) || isBlank(req.businessDescription)) {
                throw new IllegalArgumentException("Името на бизнеса, типът, градът, адресът, телефонът и описанието са задължителни");
            }
            BusinessProfile.ProviderType providerType;
            try {
                providerType = BusinessProfile.ProviderType.valueOf(req.providerType.trim().toUpperCase());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Невалиден тип на бизнес акаунта");
            }
            if (providerType == BusinessProfile.ProviderType.COMPANY && (isBlank(req.companyLegalName) || isBlank(req.companyEik) || isBlank(req.companyRepresentative))) {
                throw new IllegalArgumentException("Име на фирмата, ЕИК и МОЛ са задължителни при регистрация на фирма");
            }
            BusinessProfile bp = new BusinessProfile();
            bp.setUser(u);
            bp.setProviderType(providerType);
            bp.setBusinessName(req.businessName.trim());
            bp.setCompanyLegalName(providerType == BusinessProfile.ProviderType.COMPANY ? req.companyLegalName.trim() : null);
            bp.setCompanyEik(providerType == BusinessProfile.ProviderType.COMPANY ? req.companyEik.trim() : null);
            bp.setCompanyRepresentative(providerType == BusinessProfile.ProviderType.COMPANY ? req.companyRepresentative.trim() : null);
            bp.setCity(req.city.trim());
            bp.setAddress(req.address.trim());
            bp.setPhone(req.businessPhone.trim());
            bp.setDescription(req.businessDescription.trim());
            bp.setPhotoUrl(safeTrim(req.businessPhotoUrl));
            businessProfiles.save(bp);
        }

        emailService.send(
                u.getEmail(),
                "Добре дошъл в BookingHub",
                "Здравей, " + u.getUsername() + "!\n\nПрофилът ти в BookingHub беше създаден успешно."
        );
    }

    public String uploadRegistrationPhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(BAD_REQUEST, "Моля избери снимка");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new org.springframework.web.server.ResponseStatusException(BAD_REQUEST, "Разрешени са само снимки");
        }

        String filename = "register_" + UUID.randomUUID() + extensionOf(file.getOriginalFilename());
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException ex) {
            throw new IllegalStateException("Неуспешно качване на снимката");
        }
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private String safeTrim(String s) { return isBlank(s) ? null : s.trim(); }
    private String safe(String s) { return s == null ? "" : s; }

    private User.Role parseDevRole(String rawRole) {
        String role = rawRole == null ? "" : rawRole.trim().toUpperCase();
        return switch (role) {
            case "CLIENT" -> User.Role.CLIENT;
            case "BUSINESS" -> User.Role.BUSINESS;
            case "ADMIN" -> User.Role.ADMIN;
            default -> throw new IllegalArgumentException("Невалиден dev профил");
        };
    }

    private String devUsername(User.Role role) {
        return switch (role) {
            case CLIENT -> "dev_client";
            case BUSINESS -> "dev_business";
            case ADMIN -> "dev_admin";
        };
    }

    private User createDevUser(User.Role role) {
        String username = devUsername(role);
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@bookinghub.dev");
        user.setPasswordHash(encoder.encode("Dev12345"));
        user.setRole(role);
        user.setActive(true);
        return users.save(user);
    }

    private void ensureDevClientProfile(User user) {
        if (clientProfiles.findById(user.getId()).isPresent()) {
            return;
        }

        ClientProfile profile = new ClientProfile();
        profile.setUser(user);
        profile.setFirstName("Дев");
        profile.setLastName("Клиент");
        profile.setPhone("0888000001");
        profile.setBio("Тестов клиентски профил");
        clientProfiles.save(profile);
    }

    private void ensureDevBusinessProfile(User user) {
        if (businessProfiles.findById(user.getId()).isPresent()) {
            return;
        }

        BusinessProfile profile = new BusinessProfile();
        profile.setUser(user);
        profile.setProviderType(BusinessProfile.ProviderType.INDIVIDUAL);
        profile.setBusinessName("Дев бизнес");
        profile.setCity("София");
        profile.setAddress("Тестов адрес 1");
        profile.setPhone("0888000002");
        profile.setDescription("Тестов бизнес профил за бърза разработка.");
        businessProfiles.save(profile);
    }

    private void validatePassword(String password) {
        if (isBlank(password)) {
            throw new IllegalArgumentException("Паролата е задължителна");
        }
        String value = password.trim();
        if (value.length() < 8) {
            throw new IllegalArgumentException("Паролата трябва да е поне 8 символа");
        }
        if (!value.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Паролата трябва да съдържа поне една главна буква");
        }
        if (!value.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Паролата трябва да съдържа поне една малка буква");
        }
        if (!value.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Паролата трябва да съдържа поне една цифра");
        }
    }

    private String extensionOf(String originalFilename) {
        if (originalFilename == null) return "";
        int index = originalFilename.lastIndexOf('.');
        return index >= 0 ? originalFilename.substring(index) : "";
    }

    private String stripTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:3000";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    private String createRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Линкът за смяна на парола е невалиден");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.trim().getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception ex) {
            throw new IllegalStateException("Неуспешна обработка на линка за смяна на парола");
        }
    }

}
