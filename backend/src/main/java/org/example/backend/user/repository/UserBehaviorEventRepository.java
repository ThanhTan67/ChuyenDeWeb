package org.example.backend.user.repository;

import org.example.backend.user.entity.UserBehaviorEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBehaviorEventRepository extends JpaRepository<UserBehaviorEvent, Long> {
}
