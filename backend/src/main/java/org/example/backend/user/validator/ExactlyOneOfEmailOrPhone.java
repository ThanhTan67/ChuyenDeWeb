<<<<<<< HEAD
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
=======
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
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
