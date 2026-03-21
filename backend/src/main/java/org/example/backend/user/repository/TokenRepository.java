<<<<<<< HEAD
package org.example.backend.user.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository {
    void invalidate(String refreshToken);
    boolean isValid(String refreshToken);
=======
package org.example.backend.user.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository {
    void invalidate(String refreshToken);
    boolean isValid(String refreshToken);
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}