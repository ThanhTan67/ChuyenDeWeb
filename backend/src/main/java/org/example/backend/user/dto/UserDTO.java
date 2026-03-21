<<<<<<< HEAD
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
=======
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
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}