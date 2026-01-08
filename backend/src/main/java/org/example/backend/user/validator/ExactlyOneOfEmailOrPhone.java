package org.example.backend.user.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ExactlyOneOfEmailOrPhoneValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ExactlyOneOfEmailOrPhone {
    String message() default "Phải nhập đúng một trong hai: email hoặc số điện thoại";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
