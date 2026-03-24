package org.example.backend.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository {
    void invalidate(String refreshToken);
    boolean isValid(String refreshToken);
}