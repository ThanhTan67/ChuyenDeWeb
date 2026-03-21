package org.example.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.entity.UserBehaviorEvent;
import org.example.backend.user.repository.UserBehaviorEventRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

/**
 * Endpoint for tracking user behavior events.
 * Frontend calls POST /api/behaviors to log VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH.
 */
@RestController
@RequestMapping("/api/behaviors")
@RequiredArgsConstructor
public class BehaviorController {

    private final UserBehaviorEventRepository behaviorRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> trackBehavior(@RequestBody BehaviorRequest request) {
        UserBehaviorEvent event = new UserBehaviorEvent();
        event.setUserId(request.userId());
        event.setProductId(request.productId());
        event.setEventType(request.eventType());
        event.setSearchQuery(request.searchQuery());
        event.setCreatedAt(Instant.now());

        behaviorRepository.save(event);

        return ResponseEntity.ok(Map.of("status", "tracked"));
    }

    public record BehaviorRequest(
            Long userId,
            Long productId,
            String eventType,    // VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH
            String searchQuery   // only for SEARCH events
    ) {}
}
