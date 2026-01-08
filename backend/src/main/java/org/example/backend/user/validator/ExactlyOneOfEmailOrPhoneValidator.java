package org.example.backend.user.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.example.backend.user.dto.LoginRequestDTO;

public class ExactlyOneOfEmailOrPhoneValidator implements ConstraintValidator<ExactlyOneOfEmailOrPhone, LoginRequestDTO> {

    @Override
    public boolean isValid(LoginRequestDTO dto, ConstraintValidatorContext context) {
        boolean hasEmail = dto.getEmail() != null && !dto.getEmail().trim().isEmpty();
        boolean hasPhone = dto.getPhone() != null && !dto.getPhone().trim().isEmpty();

        if (hasEmail == hasPhone) { // cả hai đều có hoặc cả hai đều rỗng
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Chỉ được nhập email hoặc số điện thoại, không được nhập cả hai hoặc bỏ trống")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}