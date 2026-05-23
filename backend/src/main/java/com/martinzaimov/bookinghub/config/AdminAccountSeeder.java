package com.martinzaimov.bookinghub.config;

import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminAccountSeeder implements ApplicationRunner {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final boolean seedEnabled;
    private final boolean disableDevUsers;
    private final String adminUsername;
    private final String adminEmail;
    private final String adminPassword;

    public AdminAccountSeeder(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.admin.enabled:true}") boolean seedEnabled,
            @Value("${app.seed.disable-dev-users:true}") boolean disableDevUsers,
            @Value("${app.seed.admin.username:admin}") String adminUsername,
            @Value("${app.seed.admin.email:admin@bookinghub.dev}") String adminEmail,
            @Value("${app.seed.admin.password:Admin12345}") String adminPassword
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.seedEnabled = seedEnabled;
        this.disableDevUsers = disableDevUsers;
        this.adminUsername = adminUsername;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (seedEnabled) {
            seedAdminAccount();
        }
        if (disableDevUsers) {
            disableDevUser("dev_admin");
            disableDevUser("dev_client");
            disableDevUser("dev_business");
        }
    }

    private void seedAdminAccount() {
        User admin = users.findByUsernameIgnoreCase(adminUsername)
                .or(() -> users.findByEmailIgnoreCase(adminEmail))
                .orElseGet(User::new);

        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail.toLowerCase());
        admin.setRole(User.Role.ADMIN);
        admin.setActive(true);

        if (admin.getPasswordHash() == null || admin.getPasswordHash().isBlank()) {
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        }

        users.save(admin);
    }

    private void disableDevUser(String username) {
        users.findByUsernameIgnoreCase(username).ifPresent(user -> {
            if (user.isActive()) {
                user.setActive(false);
                users.save(user);
            }
        });
    }
}
