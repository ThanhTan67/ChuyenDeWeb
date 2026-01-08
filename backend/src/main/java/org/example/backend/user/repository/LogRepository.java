package org.example.backend.user.repository;

import org.example.backend.user.entity.Log;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogRepository extends JpaRepository<Log, Long> {


}
