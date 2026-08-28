package com.landed.activity;

import com.landed.activity.dto.ActivityResponse;
import com.landed.common.exception.ResourceNotFoundException;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> recent(String email) {
        User user = requireUser(email);
        return activityRepository.findTop20ByUserIdOrderByOccurredAtDesc(user.getId()).stream()
                .map(ActivityResponse::from)
                .toList();
    }

    public void record(User user, ActivityType type, String title, String description, UUID entityId) {
        activityRepository.save(new Activity(user, type, title, description, entityId));
    }

    private User requireUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
