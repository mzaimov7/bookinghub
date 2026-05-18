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
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class AuthService {

    private final UserRepository users;
    private final ClientProfileRepository clientProfiles;
    private final BusinessProfileRepository businessProfiles;
    private final PasswordEncoder encoder;
    private final Path uploadDir;

    public AuthService(UserRepository users,
                       ClientProfileRepository clientProfiles,
                       BusinessProfileRepository businessProfiles,
                       PasswordEncoder encoder,
                       @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.users = users;
        this.clientProfiles = clientProfiles;
        this.businessProfiles = businessProfiles;
        this.encoder = encoder;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional(readOnly = true)
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

        return AuthResponse.of(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                false
        );
    }

    @Transactional
    public AuthResponse loginAsDev(String requestedRole) {
        String role = requestedRole == null ? "" : requestedRole.trim().toUpperCase();

        return switch (role) {
            case "CLIENT" -> toAuthResponse(ensureDevClient(), true);
            case "BUSINESS" -> toAuthResponse(ensureDevBusiness(), true);
            case "ADMIN" -> toAuthResponse(ensureDevAdmin(), true);
            default -> throw new IllegalArgumentException("Invalid dev role");
        };
    }

    @Transactional
    public void register(RegisterRequest req) {
        String role = req.role == null ? "" : req.role.trim().toUpperCase();

        if (users.existsByUsernameIgnoreCase(req.username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (users.existsByEmailIgnoreCase(req.email)) {
            throw new IllegalArgumentException("Email already used");
        }
        if (!role.equals("CLIENT") && !role.equals("BUSINESS")) {
            throw new IllegalArgumentException("Invalid role");
        }

        User u = new User();
        u.setUsername(req.username.trim());
        u.setEmail(req.email.trim().toLowerCase());
        u.setPasswordHash(encoder.encode(req.password));
        u.setRole(User.Role.valueOf(role));
        u.setActive(true);
        users.save(u);

        if (role.equals("CLIENT")) {
            if (isBlank(req.firstName) || isBlank(req.lastName)) {
                throw new IllegalArgumentException("First name and last name are required");
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
            if (isBlank(req.providerType) || isBlank(req.businessName) || isBlank(req.city)) {
                throw new IllegalArgumentException("Business name, provider type and city are required");
            }
            BusinessProfile bp = new BusinessProfile();
            bp.setUser(u);
            bp.setProviderType(BusinessProfile.ProviderType.valueOf(req.providerType.trim().toUpperCase()));
            bp.setBusinessName(req.businessName.trim());
            bp.setCity(req.city.trim());
            bp.setAddress(safeTrim(req.address));
            bp.setPhone(safeTrim(req.businessPhone));
            bp.setPhotoUrl(safeTrim(req.businessPhotoUrl));
            businessProfiles.save(bp);
        }
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

    private String extensionOf(String originalFilename) {
        if (originalFilename == null) return "";
        int index = originalFilename.lastIndexOf('.');
        return index >= 0 ? originalFilename.substring(index) : "";
    }

    private AuthResponse toAuthResponse(User user, boolean devMode) {
        return AuthResponse.of(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                devMode
        );
    }

    private User ensureDevClient() {
        User user = users.findByUsernameIgnoreCase("dev_client")
                .orElseGet(() -> createDevUser("dev_client", "dev-client@bookinghub.local", User.Role.CLIENT));

        if (clientProfiles.findById(user.getId()).isEmpty()) {
            ClientProfile profile = new ClientProfile();
            profile.setUser(user);
            profile.setFirstName("Dev");
            profile.setLastName("Client");
            profile.setPhone("0000000000");
            clientProfiles.save(profile);
        }

        return user;
    }

    private User ensureDevBusiness() {
        User user = users.findByUsernameIgnoreCase("dev_business")
                .orElseGet(() -> createDevUser("dev_business", "dev-business@bookinghub.local", User.Role.BUSINESS));

        if (businessProfiles.findById(user.getId()).isEmpty()) {
            BusinessProfile profile = new BusinessProfile();
            profile.setUser(user);
            profile.setProviderType(BusinessProfile.ProviderType.COMPANY);
            profile.setBusinessName("Dev Business");
            profile.setCity("Sofia");
            profile.setAddress("Development Street 1");
            profile.setPhone("0000000001");
            businessProfiles.save(profile);
        }

        return user;
    }

    private User ensureDevAdmin() {
        return users.findByUsernameIgnoreCase("dev_admin")
                .orElseGet(() -> createDevUser("dev_admin", "dev-admin@bookinghub.local", User.Role.ADMIN));
    }

    private User createDevUser(String username, String email, User.Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode("dev-pass-123"));
        user.setRole(role);
        user.setActive(true);
        return users.save(user);
    }
}
