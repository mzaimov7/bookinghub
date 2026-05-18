package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.CreateResourceRequest;
import com.martinzaimov.bookinghub.dto.ResourceOTD;
import com.martinzaimov.bookinghub.dto.UpdateResourceRequest;
import com.martinzaimov.bookinghub.entity.Resource;
import com.martinzaimov.bookinghub.entity.ResourceDayOff;
import com.martinzaimov.bookinghub.entity.ResourceWeeklyOffDay;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.ResourceDayOffRepository;
import com.martinzaimov.bookinghub.repo.ResourceRepository;
import com.martinzaimov.bookinghub.repo.ResourceWeeklyOffDayRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class BusinessResourceService {

    private final ResourceRepository resources;
    private final UserRepository users;
    private final ResourceWeeklyOffDayRepository weeklyOffDays;
    private final ResourceDayOffRepository dayOffs;
    private final Path uploadDir;

    public BusinessResourceService(
            ResourceRepository resources,
            UserRepository users,
            ResourceWeeklyOffDayRepository weeklyOffDays,
            ResourceDayOffRepository dayOffs,
            @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.resources = resources;
        this.users = users;
        this.weeklyOffDays = weeklyOffDays;
        this.dayOffs = dayOffs;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public List<ResourceOTD> list(Long businessUserId) {
        assertBusiness(businessUserId);
        return resources.findAllByBusinessUserIdOrderByNameAsc(businessUserId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public Long create(Long businessUserId, CreateResourceRequest req) {
        assertBusiness(businessUserId);

        Resource.Type type;
        try {
            type = Resource.Type.valueOf(req.type.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid type. Use STAFF or TEAM.");
        }

        Resource r = new Resource();
        r.setBusinessUserId(businessUserId);
        r.setType(type);
        r.setName(req.name.trim());
        r.setActive(true);

        if (req.photoUrl != null && !req.photoUrl.trim().isEmpty()) {
            r.setPhotoUrl(req.photoUrl.trim());
        }

        r = resources.save(r);
        replaceWeeklyOffDays(r.getId(), req.weeklyOffDays);
        replaceDayOffDates(r.getId(), req.dayOffDates);
        return r.getId();
    }

    @Transactional
    public void update(Long businessUserId, Long resourceId, UpdateResourceRequest req) {
        assertBusiness(businessUserId);

        Resource r = resources.findByIdAndBusinessUserId(resourceId, businessUserId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (req.name != null) {
            String n = req.name.trim();
            if (!n.isEmpty()) r.setName(n);
        }

        if (req.active != null) {
            r.setActive(req.active);
        }

        if (req.photoUrl != null) {
            String p = req.photoUrl.trim();
            r.setPhotoUrl(p.isEmpty() ? null : p);
        }

        resources.save(r);
        if (req.weeklyOffDays != null) {
            replaceWeeklyOffDays(r.getId(), req.weeklyOffDays);
        }
        if (req.dayOffDates != null) {
            replaceDayOffDates(r.getId(), req.dayOffDates);
        }
    }

    @Transactional
    public String uploadPhoto(Long businessUserId, MultipartFile file) {
        assertBusiness(businessUserId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose an image file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        String extension = extensionOf(file.getOriginalFilename());
        String filename = "resource_" + UUID.randomUUID() + extension;

        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to upload image");
        }
    }

    private void assertBusiness(Long businessUserId) {
        User u = users.findById(businessUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (u.getRole() != User.Role.BUSINESS) {
            throw new IllegalArgumentException("Only BUSINESS can manage resources");
        }
    }

    private String extensionOf(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf(".");
        if (dot < 0 || dot == filename.length() - 1) return ".jpg";
        String ext = filename.substring(dot).toLowerCase();
        return ext.length() > 10 ? ".jpg" : ext;
    }

    private ResourceOTD toDto(Resource resource) {
        List<Integer> weeklyDays = weeklyOffDays.findByResourceId(resource.getId())
                .stream()
                .map(ResourceWeeklyOffDay::getDayOfWeek)
                .sorted()
                .toList();

        List<String> offDates = dayOffs.findByResourceIdOrderByOffDateAsc(resource.getId())
                .stream()
                .map(ResourceDayOff::getOffDate)
                .map(LocalDate::toString)
                .toList();

        return new ResourceOTD(
                resource.getId(),
                resource.getType().name(),
                resource.getName(),
                resource.isActive(),
                resource.getPhotoUrl(),
                weeklyDays,
                offDates
        );
    }

    private void replaceWeeklyOffDays(Long resourceId, List<Integer> values) {
        weeklyOffDays.deleteAll(weeklyOffDays.findByResourceId(resourceId));

        Set<Integer> validValues = (values == null ? List.<Integer>of() : values).stream()
                .filter(day -> day != null && day >= 1 && day <= 7)
                .collect(Collectors.toSet());

        for (Integer day : validValues) {
            ResourceWeeklyOffDay item = new ResourceWeeklyOffDay();
            item.setResourceId(resourceId);
            item.setDayOfWeek(day);
            weeklyOffDays.save(item);
        }
    }

    private void replaceDayOffDates(Long resourceId, List<String> values) {
        dayOffs.deleteAll(dayOffs.findByResourceIdOrderByOffDateAsc(resourceId));

        if (values == null) {
            return;
        }

        for (String raw : values) {
            if (raw == null || raw.isBlank()) {
                continue;
            }

            ResourceDayOff item = new ResourceDayOff();
            item.setResourceId(resourceId);
            item.setOffDate(LocalDate.parse(raw.trim()));
            dayOffs.save(item);
        }
    }
}
