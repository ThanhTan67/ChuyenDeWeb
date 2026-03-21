<<<<<<< HEAD
package org.example.backend.user.dto;

import jakarta.persistence.Column;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO implements Serializable {
    private Long id;
    private String methodName;
=======
package org.example.backend.user.dto;

import jakarta.persistence.Column;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO implements Serializable {
    private Long id;
    private String methodName;
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}