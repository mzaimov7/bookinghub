package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.AuthResponse;
import com.martinzaimov.bookinghub.dto.LoginRequest;
import com.martinzaimov.bookinghub.dto.RegisterRequest;
import com.martinzaimov.bookinghub.entity.BusinessProfile;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.BusinessProfileRepository;
import com.martinzaimov.bookinghub.repo.ClientProfileRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class AuthService {

    private final UserRepository users;
    private final ClientProfileRepository clientProfiles;
    private final BusinessProfileRepository businessProfiles;
    private final PasswordEncoder encoder;
    private final EmailService emailService;
    private final Path uploadDir;

    public AuthService(UserRepository users,
                       ClientProfileRepository clientProfiles,
                       BusinessProfileRepository businessProfiles,
                       PasswordEncoder encoder,
                       EmailService emailService,
                       @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.users = users;
        this.clientProfiles = clientProfiles;
        this.businessProfiles = businessProfiles;
        this.encoder = encoder;
        this.emailService = emailService;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String identifier = safeTrim(req.identifier);
        if (identifier == null) {
            throw new IllegalArgumentException("Username or email is required");
        }

        User user = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username/email or password"));

        if (!user.isActive()) {
            throw new IllegalArgumentException("This account is disabled");
        }
        if (!encoder.matches(req.password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username/email or password");
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

}
