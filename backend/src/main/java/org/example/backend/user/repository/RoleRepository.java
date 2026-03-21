<<<<<<< HEAD
package org.example.backend.user.repository;

import org.example.backend.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(String roleName);

}
=======
package org.example.backend.user.repository;

import org.example.backend.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(String roleName);

}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
