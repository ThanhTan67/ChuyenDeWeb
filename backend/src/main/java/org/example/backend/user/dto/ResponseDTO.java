<<<<<<< HEAD
package org.example.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO<T> {
    private String status;
    private String message;
    private T data;
=======
package org.example.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO<T> {
    private String status;
    private String message;
    private T data;
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
}