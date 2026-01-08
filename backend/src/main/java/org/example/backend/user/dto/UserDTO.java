package org.example.backend.user.dto;

import lombok.*;
import java.io.Serializable;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO implements Serializable {
    Long id;
    String username;
    String email;
    String phone;
    RoleDTO role;
    Integer failed;
    Boolean locked;
    Instant lockTime;
}