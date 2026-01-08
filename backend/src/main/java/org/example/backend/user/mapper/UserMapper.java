package org.example.backend.user.mapper;

import org.example.backend.user.dto.UserDTO;
import org.example.backend.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDto(User user);
    User toEntity(UserDTO dto);
}
