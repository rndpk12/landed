package com.landed.user;

import com.landed.common.exception.ResourceNotFoundException;
import com.landed.user.dto.UpdateProfileRequest;
import com.landed.user.dto.UserProfileResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.updateName(request.name().trim());
        return UserProfileResponse.from(user);
    }
}
