package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.CategorySuggestionOTD;
import com.martinzaimov.bookinghub.dto.CreateCategorySuggestionRequest;
import com.martinzaimov.bookinghub.entity.BusinessProfile;
import com.martinzaimov.bookinghub.entity.CategorySuggestion;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.BusinessProfileRepository;
import com.martinzaimov.bookinghub.repo.CategorySuggestionRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CategorySuggestionService {

    private final CategorySuggestionRepository suggestions;
    private final UserRepository users;
    private final BusinessProfileRepository businessProfiles;

    public CategorySuggestionService(
            CategorySuggestionRepository suggestions,
            UserRepository users,
            BusinessProfileRepository businessProfiles
    ) {
        this.suggestions = suggestions;
        this.users = users;
        this.businessProfiles = businessProfiles;
    }

    @Transactional
    public CategorySuggestionOTD createSuggestion(Long businessUserId, CreateCategorySuggestionRequest request) {
        User user = users.findById(businessUserId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Business user not found"));
        if (user.getRole() != User.Role.BUSINESS) {
            throw new ResponseStatusException(BAD_REQUEST, "Only business accounts can suggest categories");
        }

        String suggestionText = normalize(request.suggestion);
        if (suggestionText == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Suggestion text is required");
        }

        CategorySuggestion suggestion = new CategorySuggestion();
        suggestion.setName(shortNameOf(suggestionText));
        suggestion.setDescription(suggestionText);
        suggestion.setSuggestedByUserId(businessUserId);
        suggestion.setStatus(CategorySuggestion.Status.PENDING);

        CategorySuggestion saved = suggestions.save(suggestion);
        BusinessProfile businessProfile = businessProfiles.findById(businessUserId).orElse(null);
        return toDto(saved, businessProfile);
    }

    private CategorySuggestionOTD toDto(CategorySuggestion suggestion, BusinessProfile businessProfile) {
        return new CategorySuggestionOTD(
                suggestion.getId(),
                suggestion.getSuggestedByUserId(),
                businessProfile != null ? businessProfile.getBusinessName() : "Бизнес профил",
                suggestion.getName(),
                suggestion.getDescription(),
                suggestion.getStatus().name(),
                suggestion.getAdminNote(),
                suggestion.getCreatedAt() == null ? null : suggestion.getCreatedAt().toString(),
                suggestion.getUpdatedAt() == null ? null : suggestion.getUpdatedAt().toString()
        );
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String shortNameOf(String value) {
        if (value.length() <= 120) return value;
        return value.substring(0, 120).trim();
    }
}
