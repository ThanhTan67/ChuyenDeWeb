package org.example.backend.dto;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImageDTO implements Serializable {
    private String publicId;
    private boolean isMain;
}