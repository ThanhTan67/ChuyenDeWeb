<<<<<<< HEAD
package org.example.backend.user.mapper;

import org.example.backend.user.dto.UserDTO;
import org.example.backend.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDto(User user);
}
=======
package org.example.backend.user.mapper;

import org.example.backend.user.dto.UserDTO;
import org.example.backend.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDto(User user);
    User toEntity(UserDTO dto);
}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
